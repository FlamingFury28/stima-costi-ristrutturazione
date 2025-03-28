import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const costItems = [
  { id: "umidita", label: "Umidità di risalita", type: "area", min: 6, max: 10 },
  { id: "crepe", label: "Crepe strutturali", type: "area", min: 3, max: 5 },
  { id: "tetto", label: "Tetto da rifare", type: "area", min: 18, max: 34 },
  { id: "amianto", label: "Rimozione amianto (tetto)", type: "amianto", min: 13, max: 20 },
  { id: "elettrico", label: "Impianto elettrico", type: "area", min: 5, max: 8 },
  { id: "idraulico_completo", label: "Impianto idraulico completo (bagni inclusi)", type: "bagni", min: 1000, max: 1800 },
  { id: "facciata", label: "Cappotto o facciata", type: "area", min: 15, max: 30 },
  { id: "infissi", label: "Infissi e serramenti", type: "area", min: 20, max: 40 },
  { id: "pavimenti", label: "Pavimenti e rivestimenti", type: "area", min: 12, max: 25 }, 
  { id: "esterno_auto", label: "Pavimentazione esterna per auto", type: "fixed", min: 600, max: 1200 },
  { id: "permessi", label: "Permessi e pratiche", type: "fixed", min: 500, max: 1500 },
  { id: "sanatorie", label: "Sanatorie/accatastamenti", type: "fixed", min: 300, max: 2000 } 
];

export default function CostEstimator() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [area, setArea] = useState("");
  const [amiantoArea, setAmiantoArea] = useState("");
  const [numBagni, setNumBagni] = useState(1);
  const [propertyName, setPropertyName] = useState("");
  const [agencyName, setAgencyName] = useState("");

  const toggleItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toNumber = (value) => {
    const n = parseFloat(value);
    return isNaN(n) ? 0 : n;
  };

  const computeCostDetails = () => {
    const visibleItems = costItems.filter(
      (item) =>
        selectedItems.includes(item.id) ||
        (item.id === "amianto" && toNumber(amiantoArea) > 0)
    );

    return visibleItems.map((item) => {
      let min = 0, max = 0;
      if (item.type === "area") {
        min = item.min * toNumber(area);
        max = item.max * toNumber(area);
      } else if (item.type === "amianto") {
        min = item.min * toNumber(amiantoArea);
        max = item.max * toNumber(amiantoArea);
      } else if (item.type === "bagni") {
        min = item.min * numBagni;
        max = item.max * numBagni;
      } else {
        min = item.min;
        max = item.max;
      }
      return { label: item.label, min, max };
    });
  };

  const costDetails = computeCostDetails();
  const totalMin = costDetails.reduce((sum, item) => sum + item.min, 0);
  const totalMax = costDetails.reduce((sum, item) => sum + item.max, 0);

  const handleDownloadPDF = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const marginLeft = 40;
    let y = 40;

    doc.setFont("helvetica", "");
    doc.setFontSize(18);
    doc.text("Stima dei Costi di Ristrutturazione", marginLeft, y);

    y += 30;
    doc.setDrawColor(180);
    doc.line(marginLeft, y, 555, y);
    y += 15;

    doc.setFontSize(12);
    const today = new Date().toLocaleDateString("it-IT");
    doc.text(`Data: ${today}`, marginLeft, y);
    y += 20;
    doc.text(`Immobile: ${propertyName || "(non specificato)"}`, marginLeft, y);
    y += 20;
    doc.text(`Agenzia: ${agencyName || "(non specificata)"}`, marginLeft, y);
    y += 20;
    doc.text(`Metratura: ${area || 0} mq`, marginLeft, y);
    y += 20;
    doc.text(`Amianto: ${amiantoArea || 0} mq`, marginLeft, y);
    y += 20;
    doc.text(`Bagni: ${numBagni}`, marginLeft, y);
    y += 10;

    doc.line(marginLeft, y, 555, y);
    y += 20;

    autoTable(doc, {
      startY: y,
      head: [["Intervento", "Costo Min", "Costo Max"]],
      body: costDetails.map(item => [
        item.label,
        `${Math.round(item.min)} €`,
        `${Math.round(item.max)} €`
      ]),
      margin: { left: marginLeft, right: marginLeft },
      tableWidth: "auto",
      styles: {
        fontSize: 10,
        font: "helvetica",
        cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [41, 128, 185],
        halign: "center",
        fontStyle: "bold",
        textColor: 255,
      },
      bodyStyles: {
        textColor: 50,
        lineWidth: 0.1,
        lineColor: 200,
      },
      columnStyles: {
        0: { cellWidth: "auto" },
        1: { halign: "right", cellWidth: 80 },
        2: { halign: "right", cellWidth: 80 },
      },
      didDrawPage: (data) => {
        doc.setDrawColor(220);
        doc.line(marginLeft, data.cursor.y + 10, 555, data.cursor.y + 10);
      },
    });

    const afterTableY = doc.lastAutoTable.finalY + 25;
    const boxWidth = 515 - marginLeft;
    doc.setFillColor(230);
    doc.roundedRect(marginLeft, afterTableY, boxWidth, 35, 4, 4, "F");
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text(
      `Totale stimato: ${Math.round(totalMin)} € – ${Math.round(totalMax)} €`,
      marginLeft + 10,
      afterTableY + 22
    );

    const filename = `${propertyName || "immobile"}_${agencyName || "agenzia"}`.replace(/\s+/g, "_").toLowerCase() + ".pdf";
    doc.save(filename);
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="flex justify-end mb-4">
        <Button variant="outline" onClick={() => setSelectedItems([])}>
          Deseleziona tutto
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <Label htmlFor="property">Nome immobile</Label>
          <Input id="property" value={propertyName} onChange={(e) => setPropertyName(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="agency">Nome agenzia</Label>
          <Input id="agency" value={agencyName} onChange={(e) => setAgencyName(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="area">Metratura immobile (mq)</Label>
          <Input id="area" type="number" value={area} onChange={(e) => setArea(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="amianto">Metratura tetto in amianto (mq)</Label>
          <Input id="amianto" type="number" value={amiantoArea} onChange={(e) => setAmiantoArea(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="bagni">Numero di bagni</Label>
          <Input id="bagni" type="number" value={numBagni} onChange={(e) => setNumBagni(Number(e.target.value))} />
        </div>
      </div>

      <p className="mb-4 text-center sm:text-left">Seleziona gli interventi necessari per stimare un intervallo di spesa totale.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {costItems.filter(item => item.id !== "amianto").map(item => (
          <Card
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={`cursor-pointer transition-all duration-200 ${selectedItems.includes(item.id) ? "bg-blue-100 border-blue-500" : "hover:bg-gray-100"}`}
          >
            <CardContent className="p-4">
              <Label className="font-medium text-base">{item.label}</Label>
              <p className="text-sm text-muted-foreground">
                {item.type === "fixed"
                  ? `${item.min.toLocaleString()} € – ${item.max.toLocaleString()} €`
                  : item.type === "bagni"
                    ? `${item.min.toLocaleString()} € – ${item.max.toLocaleString()} € per bagno`
                    : `${item.min} € – ${item.max} € al mq`}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <h1 className="text-2xl font-bold mb-4 text-center sm:text-left">Stima dei Costi di Ristrutturazione</h1>
      <div className="text-center text-lg font-semibold mb-4">
        Totale stimato: {totalMin.toLocaleString()} € – {totalMax.toLocaleString()} €
      </div>

      <div className="flex justify-center">
        <Button onClick={handleDownloadPDF}>Scarica PDF</Button>
      </div>
    </div>
  );
}
