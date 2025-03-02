import * as d3 from "d3";

/**
 * Ajoute les labels textuels et les interactions aux segments d'un Sunburst Chart.
 * Le texte suit l'arc du segment et est positionné au milieu de l'arc,
 * tout en prenant en compte les nœuds transformés ("Tampon").
 *
 * @param {Selection} segmentGroup - Groupe D3 des segments.
 * @param {Function} arc - Fonction D3 de l'arc.
 * @param {String} chartId - Identifiant unique du chart (ex: 'cat', 'niv1', 'niv2').
 */
export function drawLabels(segmentGroup, arc, chartId) {
  segmentGroup.each(function (d, i) {
    const segment = d3.select(this);
    
    // Vérification si le nœud est un "Tampon" ou une compétence standard
    const isTampon = d.data.id && d.data.id.startsWith("TAMPON");
    
    // Calcul de l'angle moyen et du rayon moyen du segment
    const midAngle = (d.x0 + d.x1) / 2;
    const midRadius = (d.y0 + d.y1) / 2;
    const midAngleDegrees = midAngle * 180 / Math.PI;
    const flip = midAngleDegrees > 90 && midAngleDegrees < 270;


    // Calcul de la longueur de l'arc (en pixels) pour le segment
    const arcLength = (d.x1 - d.x0) * midRadius ;
    const allowedLineLength = 0.9 * arcLength; // 90 % de la longueur de l'arc
    const baseFontSize = 10; // Taille de police max
    const minFontSize = 5;  // Taille de police min
    const maxArcWidth = 250; // Largeur max d'arc considérée
    const fontSize = Math.max(minFontSize, Math.min(baseFontSize, arcLength / maxArcWidth * baseFontSize));

    // Création d'un élément texte temporaire pour mesurer la longueur en pixels
    const tempText = segment.append("text")
      .attr("visibility", "hidden")
      .attr("font-size", fontSize.value); // doit correspondre à la taille utilisée pour l'affichage

    /**
     * Découpe le texte en lignes tout en s'assurant que les mots ne sont pas coupés.
     * @param {String} text - Le texte à découper.
     * @param {Number} allowedLength - Longueur maximale autorisée pour une ligne.
     * @returns {Array} Tableau de lignes.
     */
    function splitText(text, allowedLength) {
      const words = text.split(" ");
      const lines = [];
      let currentLine = "";

      words.forEach(word => {
        const testLine = currentLine ? currentLine + " " + word : word;
        tempText.text(testLine);
        const measuredLength = tempText.node().getComputedTextLength();

        if (measuredLength <= allowedLength) {
          currentLine = testLine;
        } else {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
        }
      });
      if (currentLine) lines.push(currentLine);
      
      return flip ? lines : lines.reverse(); // Inversion des lignes si besoin
    }

    const lines = splitText(d.data.shortdesc || d.data.name, allowedLineLength);
    tempText.remove(); // Suppression de l'élément temporaire

    // Définition de la hauteur de ligne (en pixels)
    const lineHeight = fontSize ;

    // Calcul de l'offset vertical pour centrer les lignes
    const totalOffset = (lines.length - 1) * lineHeight;
    const startOffset = -totalOffset / 2;

    // Création des textes alignés sur les segments
    lines.forEach((line, lineIndex) => {
      const lineRadius = flip ? 1.02 * (midRadius + startOffset + lineIndex * lineHeight) : 0.98 * (midRadius + startOffset + lineIndex * lineHeight);
      const startAngle = flip ? d.x1 : d.x0;
      const endAngle = flip ? d.x0 : d.x1;

      const lineArc = d3.arc()
        .innerRadius(lineRadius)
        .outerRadius(lineRadius)
        .startAngle(startAngle)
        .endAngle(endAngle);

      const pathId = `labelArc-${chartId}-${i}-${lineIndex}`;

      segment.append("path")
        .attr("id", pathId)
        .attr("d", lineArc)
        .attr("fill", "none")
        .attr("stroke", "none");

      const startOffsetValue = flip
        ? ((d.x1 - midAngle) / (d.x1 - d.x0)) * 50
        : ((midAngle - d.x0) / (d.x1 - d.x0)) * 50;

      segment.append("text")
        .attr("class", "donutText")
        .attr("font-size", `${fontSize}px`)
        .append("textPath")
        .attr("xlink:href", `#${pathId}`)
        .attr("startOffset", `${startOffsetValue}%`)
        .style("text-anchor", "middle")
        .text(line);
    });
  });
}
