import { createProject, uid, type Project } from "./project";
import { suggestCircuits } from "../calculations/engine";
export function createExample(): Project {
  const S = createProject();
  Object.assign(S.installation, {
    tipo: "residencial",
    sistema: "bi",
    vf: 127,
    vff: 220,
    freq: 60,
    material: "Cu",
    isolacao: "PVC 70 °C",
    temp: 30,
    quedaLimite: 4,
    distAlim: 12,
    expansao: 20,
  });
  S.rooms = [
    {
      id: uid(),
      name: "Sala",
      type: "Sala",
      l: 4,
      w: 3,
      tugs: 3,
      tugVA: 100,
      lamp: 18,
    },
    {
      id: uid(),
      name: "Quarto",
      type: "Quarto",
      l: 3.5,
      w: 3,
      tugs: 2,
      tugVA: 100,
      lamp: 12,
    },
    {
      id: uid(),
      name: "Cozinha",
      type: "Cozinha",
      l: 3,
      w: 2.5,
      tugs: 4,
      tugVA: 100,
      lamp: 12,
    },
    {
      id: uid(),
      name: "Banheiro",
      type: "Banheiro",
      l: 2,
      w: 2,
      tugs: 1,
      tugVA: 600,
      lamp: 10,
    },
  ];
  S.loads = [
    {
      id: uid(),
      type: "Chuveiro",
      name: "Chuveiro",
      room: "Banheiro",
      p: 5500,
      v: 220,
      fp: 1,
      q: 1,
      d: 12,
    },
    {
      id: uid(),
      type: "Forno elétrico",
      name: "Forno",
      room: "Cozinha",
      p: 3000,
      v: 220,
      fp: 0.95,
      q: 1,
      d: 10,
    },
    {
      id: uid(),
      type: "Ar-condicionado",
      name: "Ar-condicionado",
      room: "Quarto",
      p: 1200,
      v: 127,
      fp: 0.9,
      q: 1,
      d: 15,
    },
  ];
  S.circuits = suggestCircuits(S);
  return S;
}
