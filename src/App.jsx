import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import html2pdf from "html2pdf.js";

const costItems = [
  { id: "umidita", label: "Umidità di risalita", type: "area", min: 10, max: 20 },
  { id: "crepe", label: "Crepe strutturali", type: "area", min: 5, max: 15 },
  { id: "tetto", label: "Tetto da rifare", type: "area", min: 30, max: 80 },
  { id: "amianto", label: "Rimozione amianto (tetto)", type: "amianto", min: 8, max: 25 },
  { id: "elettrico", label: "Impianto elettrico", type: "area", min: 10, max: 20 },
  { id: "idraulico", label: "Impianto idraulico", type: "area", min: 10, max: 25 },
  { id: "riscaldamento", label: "Riscaldamento completo", type: "area", min: 15, max: 40 },
  { id: "fognatura", label: "Scarichi/fognatura", type: "area", min: 8, max: 20 },
  { id: "facciata", label: "Cappotto o facciata", type: "area", min: 25, max: 60 },
  { id: "infissi", label: "Infissi e serramenti", type: "area", min: 30, max: 60 },
  { id: "pavimenti", label: "Pavimenti e rivestimenti", type: "area", min: 20, max: 50 },
  { id: "giardino", label: "Sistemazione esterna", type: "area", min: 8, max: 25 },
  { id: "progetto", label: "Progetto e direzione lavori", type: "fixed", min: 0, max: 0 },
  { id: "permessi", label: "Permessi e pratiche", type: "fixed", min: 500, max: 1500 },
  { id: "sanatorie", label: "Sanatorie/accatastamenti", type: "fixed", min: 300, max: 2000 },
  { id: "bagni", label: "Bagni completi da rifare", type: "bagni", min: 1500, max: 3000 },
];

export default function CostEstimator() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [area, setArea] = useState(0);
  const [amiantoArea, setAmiantoArea] = useState(0);
  const [numBagni, setNumBagni] = useState(1);
  const resultRef = useRef(null);

  const toggleItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const totalMin = selectedItems.reduce((sum, id) => {
    const item = costItems.find((item) => item.id === id);
    if (item.type === "area") return sum + item.min * area;
    if (item.type === "amianto" && amiantoArea > 0) return sum + item.min * amiantoArea;
    if (item.type === "bagni") return sum + item.min * numBagni;
    return sum + item.min;
  }, 0);

  const totalMax = selectedItems.reduce((sum, id) => {
    const item = costItems.find((item) => item.id === id);
    if (item.type === "area") return sum + item.max * area;
    if (item.type === "amianto" && amiantoArea > 0) return sum + item.max * amiantoArea;
    if (item.type === "bagni") return sum + item.max * numBagni;
    return sum + item.max;
  }, 0);

  const handleDownloadPDF = () => {
    if (resultRef.current) {
      html2pdf()
        .set({ margin: 1, filename: "stima_ristrutturazione.pdf", html2canvas: { scale: 2 } })
        .from(resultRef.current)
        .save();
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Stima dei Costi di Ristrutturazione</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <Label htmlFor="area">Metratura immobile (mq)</Label>
          <Input
            id="area"
            type="number"
            value={area}
            onChange={(e) => setArea(Number(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="amianto">Metratura tetto in amianto (mq)</Label>
          <Input
            id="amianto"
            type="number"
            value={amiantoArea}
            onChange={(e) => setAmiantoArea(Number(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="bagni">Numero di bagni</Label>
          <Input
            id="bagni"
            type="number"
            value={numBagni}
            onChange={(e) => setNumBagni(Number(e.target.value))}
          />
        </div>
      </div>
      <p className="mb-4">Seleziona gli interventi necessari per stimare un intervallo di spesa totale.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {costItems.map((item) => (
          <Card
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={`cursor-pointer transition-all duration-200 ${
              selectedItems.includes(item.id)
                ? "bg-blue-100 border-blue-500"
                : "hover:bg-gray-100"
            }`}
          >
            <CardContent className="p-4">
              <Label className="font-medium text-base">{item.label}</Label>
              <p className="text-sm text-muted-foreground">
                {item.type === "fixed"
                  ? `${item.min.toLocaleString()} € – ${item.max.toLocaleString()} €`
                  : `${item.min} € – ${item.max} € al mq`}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div ref={resultRef} className="p-4 border rounded-xl bg-gray-50 mb-4">
        <h2 className="text-lg font-semibold mb-2">Totale stimato:</h2>
        <p className="text-xl font-bold">
          {totalMin.toLocaleString()} € – {totalMax.toLocaleString()} €
        </p>
      </div>
      <Button onClick={handleDownloadPDF}>Salva come PDF</Button>
    </div>
  );
}
