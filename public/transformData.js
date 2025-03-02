import * as d3 from "d3";

export function transformDataForVue(originalData) {
  
  function transformNode(node, depth = 0) {
    if (depth === 0) {
      return {
        ...node,
        children: node.children
          .map(child => transformNode(child, depth + 1))
          .sort((a, b) => d3.ascending(a.name, b.name)) // ✅ Trie les catégories (depth 1)
      };
    }

    if (depth === 1) {
      const tamponChildren = [];

      node.children.forEach(child => {
        if (child.children) {
          tamponChildren.push(
            ...child.children.sort((a, b) => d3.ascending(a.name, b.name)) // ✅ Trie avant fusion
          );
        }
      });

      return {
        id: node.id,
        name: node.name,
        niveau: node.niveau,
        prérogative: node.prérogative,
        description: node.description,
        children: tamponChildren.length > 0 
          ? [{
              id: `TAMPON-${node.name}`,
              name: node.name, // 📌 Utilisation du nom de la catégorie
              niveau: 2,
              prérogative: "Fusion",
              description: `Regroupe les compétences de ${node.name}`,
              children: tamponChildren
            }]
          : undefined
      };
    }

    return {
      id: node.id,
      name: node.name,
      niveau: node.niveau,
      prérogative: node.prérogative,
      description: node.description,
      children: node.children?.length > 0 
        ? node.children.map(child => transformNode(child, depth + 1)) 
        : undefined
    };
  }

  return transformNode(originalData);
}

// 🌟 Fonction pour tester la structure transformée dans la console
export function logTransformedData(originalData) {
  console.log("🔍 Données transformées :");
  console.log(JSON.stringify(transformDataForVue(originalData), null, 3));
}
