import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const costItems = [
  { id: "umidita", label: "Umidità di risalita", min: 2000, max: 4000 },
  { id: "crepe", label: "Crepe strutturali", min: 1000, max: 3000 },
  { id: "tetto", label: "Tetto da rifare", min: 3000, max: 8000 },
  { id: "amianto", label: "Rimozione amianto", min: 800, max: 2500 },
  { id: "elettrico", label: "Impianto elettrico", min: 1000, max: 2000 },
  { id: "idraulico", label: "Impianto idraulico", min: 1000, max: 2500 },
  { id: "riscaldamento", label: "Riscaldamento completo", min: 1500, max: 4000 },
  { id: "fognatura", label: "Scarichi/fognatura", min: 800, max: 2000 },
  { id: "facciata", label: "Cappotto o facciata", min: 2500, max: 6000 },
  { id: "infissi", label: "Infissi e serramenti", min: 3000, max: 6000 },
  { id: "pavimenti", label: "Pavimenti e rivestimenti", min: 2000, max: 5000 },
  { id: "giardino", label: "Sistemazione esterna", min: 800, max: 2500 },
  { id: "progetto", label: "Progetto e direzione lavori", min: 0, max: 0 },
  { id: "permessi", label: "Permessi e pratiche", min: 500, max: 1500 },
  { id: "sanatorie", label: "Sanatorie/accatastamenti", min: 300, max: 2000 },
];

export default function CostEstimator() {
  const [selectedItems, setSelectedItems] = useState([]);

  const toggleItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const resetSelection = () => {
    setSelectedItems([]);
  };

  const totalMin = selectedItems.reduce(
    (sum, id) => sum + costItems.find((item) => item.id === id).min,
    0
  );
  const totalMax = selectedItems.reduce(
    (sum, id) => sum + costItems.find((item) => item.id === id).max,
    0
  );

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-slate-800">Stima dei Costi di Ristrutturazione</h1>
        <p className="mb-6 text-slate-600">Seleziona gli interventi necessari per stimare un intervallo di spesa totale (solo materiali e strumenti, manodopera esclusa).</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {costItems.map((item) => (
            <Card
              key={item.id}
              onClick={() => toggleItem(item.id)} 
              className={`cursor-pointer transition-all duration-200 ${
                selectedItems.includes(item.id)
                  ? "border-blue-500 ring-2 ring-blue-300 bg-blue-50"
                  : "hover:bg-white"
              }`}
            >
              <CardContent className="p-4">
                <Label className="font-medium text-base mb-1 text-slate-800 block">{item.label}</Label>
                <div className="text-sm text-slate-600">
                  {item.min.toLocaleString()} € – {item.max.toLocaleString()} €
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="p-4 border rounded-xl bg-white shadow-sm mb-6">
          <h2 className="text-lg font-semibold mb-2 text-slate-700">Totale stimato:</h2>
          <p className="text-2xl font-bold text-slate-900">
            {totalMin.toLocaleString()} € – {totalMax.toLocaleString()} €
          </p>
        </div>
        <Button variant="outline" onClick={resetSelection}>Reset selezione</Button>
      </div>
    </div>
  );
}