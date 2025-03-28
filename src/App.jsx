import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PDFDownloadLink, Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

const costItems = [
  { id: "umidita", label: "Umidità di risalita", type: "area", min: 7, max: 12 },
  { id: "crepe", label: "Crepe strutturali", type: "area", min: 4, max: 8 },
  { id: "tetto", label: "Tetto da rifare", type: "area", min: 20, max: 40 },
  { id: "amianto", label: "Rimozione amianto (tetto)", type: "amianto", min: 8, max: 18 },
  { id: "elettrico", label: "Impianto elettrico", type: "area", min: 7, max: 12 },
  { id: "idraulico", label: "Impianto idraulico", type: "area", min: 7, max: 15 },
  { id: "fognatura", label: "Scarichi/fognatura", type: "area", min: 5, max: 10 },
  { id: "facciata", label: "Cappotto o facciata", type: "area", min: 20, max: 40 },
  { id: "infissi", label: "Infissi e serramenti", type: "area", min: 25, max: 40 },
  { id: "pavimenti", label: "Pavimenti e rivestimenti", type: "area", min: 15, max: 30 },
  { id: "giardino", label: "Sistemazione esterna", type: "area", min: 5, max: 10 },
  { id: "esterno_auto", label: "Pavimentazione esterna per auto", type: "fixed", min: 800, max: 1500 },
  { id: "permessi", label: "Permessi e pratiche", type: "fixed", min: 500, max: 1500 },
  { id: "sanatorie", label: "Sanatorie/accatastamenti", type: "fixed", min: 300, max: 2000 },
  { id: "bagni", label: "Bagni completi da rifare", type: "bagni", min: 1200, max: 2000 },
];

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12, fontFamily: 'Helvetica' },
  section: { marginBottom: 10 },
  title: { fontSize: 18, marginBottom: 10 },
  text: { marginBottom: 4 },
  bold: { fontWeight: 'bold' }
});

const PDFDocument = ({ propertyName, agencyName, area, amiantoArea, numBagni, today, costDetails, totalMin, totalMax }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.title}>Stima dei Costi di Ristrutturazione</Text>
        <Text style={styles.text}>Data: {today}</Text>
        <Text style={styles.text}>Immobile: {propertyName || "(non specificato)"}</Text>
        <Text style={styles.text}>Agenzia: {agencyName || "(non specificata)"}</Text>
        <Text style={styles.text}>Metratura immobile: {area || 0} mq</Text>
        <Text style={styles.text}>Tetto in amianto: {amiantoArea || 0} mq</Text>
        <Text style={styles.text}>Numero di bagni: {numBagni}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.bold}>Dettaglio costi stimati:</Text>
        {costDetails.map((item, index) => (
          <Text key={index} style={styles.text}>
            • {item.label}: {item.min.toLocaleString()} € – {item.max.toLocaleString()} €
          </Text>
        ))}
      </View>
      <View style={styles.section}>
        <Text style={styles.bold}>Totale stimato:</Text>
        <Text style={styles.text}>{totalMin.toLocaleString()} € – {totalMax.toLocaleString()} €</Text>
      </View>
    </Page>
  </Document>
);

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

  const computeCostDetails = () => {
    let details = [];
    const visibleItems = costItems.filter(
      (item) => selectedItems.includes(item.id) || (item.id === "amianto" && parseFloat(amiantoArea) > 0)
    );

    visibleItems.forEach((item) => {
      let min = 0;
      let max = 0;
      if (item.type === "area") {
        min = item.min * parseFloat(area || 0);
        max = item.max * parseFloat(area || 0);
      } else if (item.type === "amianto") {
        min = item.min * parseFloat(amiantoArea || 0);
        max = item.max * parseFloat(amiantoArea || 0);
      } else if (item.type === "bagni") {
        min = item.min * numBagni;
        max = item.max * numBagni;
      } else {
        min = item.min;
        max = item.max;
      }
      details.push({ label: item.label, min, max });
    });

    return details;
  };

  const costDetails = computeCostDetails();
  const totalMin = costDetails.reduce((sum, item) => sum + item.min, 0);
  const totalMax = costDetails.reduce((sum, item) => sum + item.max, 0);
  const today = new Date().toLocaleDateString();

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center sm:text-left">Stima dei Costi di Ristrutturazione</h1>
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
          <Input id="area" type="text" inputMode="numeric" pattern="[0-9]*" value={area} onChange={(e) => setArea(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="amianto">Metratura tetto in amianto (mq)</Label>
          <Input id="amianto" type="text" inputMode="numeric" pattern="[0-9]*" value={amiantoArea} onChange={(e) => setAmiantoArea(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="bagni">Numero di bagni</Label>
          <Input id="bagni" type="number" value={numBagni} onChange={(e) => setNumBagni(Number(e.target.value))} />
        </div>
      </div>

      <p className="mb-4 text-center sm:text-left">Seleziona gli interventi necessari per stimare un intervallo di spesa totale.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {costItems.filter(item => item.id !== "amianto").map((item) => (
          <Card key={item.id} onClick={() => toggleItem(item.id)} className={`cursor-pointer transition-all duration-200 ${selectedItems.includes(item.id) ? "bg-blue-100 border-blue-500" : "hover:bg-gray-100"}`}>
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

      <div className="flex justify-center">
        <PDFDownloadLink
          document={
            <PDFDocument
              propertyName={propertyName}
              agencyName={agencyName}
              area={area}
              amiantoArea={amiantoArea}
              numBagni={numBagni}
              today={today}
              costDetails={costDetails}
              totalMin={totalMin}
              totalMax={totalMax}
            />
          }
          fileName="stima_ristrutturazione.pdf"
        >
          {({ loading }) => (
            <Button>{loading ? "Generazione PDF..." : "Scarica PDF (alta qualità)"}</Button>
          )}
        </PDFDownloadLink>
      </div>
    </div>
  );
}