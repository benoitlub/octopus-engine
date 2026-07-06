import { OctopusEngine } from "../octopus.js";

const engine = new OctopusEngine();
const result = await engine.start();

console.log(result.brief);
console.log("");
console.log("Ressources:");
for (const resource of result.resources.resources) {
  console.log(`- ${resource.name}: ${resource.status}`);
}

if (result.mission?.status === "waiting-authorization") {
  console.log("");
  console.log("Autorisation requise: le poulpe demande l'accord du jardinier avant d'utiliser la ressource.");
}
