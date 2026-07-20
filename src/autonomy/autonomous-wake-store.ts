import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { AutonomousWake, WakeStoreSnapshot } from "./types.js";

const EMPTY: WakeStoreSnapshot = { version: 1, wakes: [] };

export class AutonomousWakeStore {
  constructor(private readonly path = process.env.OCTOPUS_WAKE_STORE ?? ".octopus/wakes.json") {}

  async list(): Promise<AutonomousWake[]> {
    return (await this.read()).wakes.map((wake) => ({ ...wake, mission: { ...wake.mission, context: { ...wake.mission.context } } }));
  }

  async get(id: string): Promise<AutonomousWake | undefined> {
    return (await this.list()).find((wake) => wake.id === id);
  }

  async save(wake: AutonomousWake): Promise<AutonomousWake> {
    const snapshot = await this.read();
    const index = snapshot.wakes.findIndex((item) => item.id === wake.id);
    if (index >= 0) snapshot.wakes[index] = wake;
    else snapshot.wakes.push(wake);
    await this.write(snapshot);
    return wake;
  }

  async due(now = new Date()): Promise<AutonomousWake[]> {
    const timestamp = now.getTime();
    return (await this.list()).filter((wake) => wake.status !== "paused" && new Date(wake.nextRunAt).getTime() <= timestamp);
  }

  async claim(id: string, owner: string, leaseMs: number, now = new Date()): Promise<AutonomousWake | undefined> {
    const snapshot = await this.read();
    const wake = snapshot.wakes.find((item) => item.id === id);
    if (!wake || wake.status === "paused") return undefined;
    const lockActive = wake.lockUntil && new Date(wake.lockUntil).getTime() > now.getTime();
    if (lockActive && wake.lockOwner !== owner) return undefined;

    wake.status = "claimed";
    wake.lockOwner = owner;
    wake.lockUntil = new Date(now.getTime() + leaseMs).toISOString();
    wake.updatedAt = now.toISOString();
    await this.write(snapshot);
    return { ...wake };
  }

  private async read(): Promise<WakeStoreSnapshot> {
    try {
      const raw = await readFile(this.path, "utf8");
      const parsed = JSON.parse(raw) as Partial<WakeStoreSnapshot>;
      return parsed.version === 1 && Array.isArray(parsed.wakes) ? { version: 1, wakes: parsed.wakes } : structuredClone(EMPTY);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return structuredClone(EMPTY);
      throw error;
    }
  }

  private async write(snapshot: WakeStoreSnapshot): Promise<void> {
    await mkdir(dirname(this.path), { recursive: true });
    const temporary = `${this.path}.${process.pid}.tmp`;
    await writeFile(temporary, JSON.stringify(snapshot, null, 2), "utf8");
    await rename(temporary, this.path);
  }
}
