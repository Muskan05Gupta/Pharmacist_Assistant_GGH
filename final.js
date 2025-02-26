// Load environment variables
const GEMINI_API_KEY = config.GEMINI_API_KEY;

async function uploadImage() {
    let fileInput = document.getElementById("fileInput").files[0];

    if (!fileInput) {
        alert("Please select an image!");
        return;
    }

    let reader = new FileReader();
    reader.readAsDataURL(fileInput);

    reader.onload = async function () {
        let base64Image = reader.result.split(',')[1];
        let mimeType = fileInput.type;

        try {
            let response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            {
                                inlineData: {
                                    mimeType: mimeType,
                                    data: base64Image,
                                },
                            },
                            {
                                text: `Extract and return the following details in the given format:
                                - **Doctor's Name** - **Clinic Information** - **Patient's Name**
                                - **Medicines (with dosage, duration, and schedule: OD, BD, TDS, or custom format _+_+_)** - **Advice/Instructions** **Rules**: 
                                - If handwriting is unclear, find the closest matching medicine name, do not give any random name in medicines, strictly stick to it. 
                                - The mane of medicine you select should be from the list of known medicines.
                                - Do NOT include any word in the medicine list that is not an actual medicine. Please match the medicine name with the list of known medicines.
                                - If mg is not mentioned, no need to write anything in the dosage field.
                                - Extract medicine timing from (_+_+_) format (e.g., "1+0+1" means morning and night). 
                                - For all those who are not able to extract the data, return "Unknown" in the respective fields EXCEPT in prescribed medicines field.
                                - Provide all answers in English
                                - Medicines name should be matched against your knowledge of medicines.
                                - First find out the number of visits to the prescription and then extract the details of each visit.
                                - Do not give anything in bold
                                - Do NOT write any "Unknown" in Prescribed Medicines section.
                                - Take care that if there is a syrup in medicines section, its quantity will be defined in ml.
                                - Return data in this format:
                                    Patient's Details
                                        Name: ...
                                        Age: ...
                                        Gender: ...
                                        Phone: ...
                                    Doctor's Details
                                        Name: ...
                                        Clinic: ...
                                        Contact: ...
                                    Visit History
                                        Visit 1 (Date: ...)
                                            Complaints:
                                                ...
                                                ...
                                                ...
                                            Prescribed Medicines:
                                                Paracetamol - 500mg - Schedule: OD - Duration: 5 days
                                                Amoxicillin - 250mg - Schedule: BD - Duration: 7 days
                                            Doctor's Advice:
                                                Drink water
                                                Avoid alcohol
                                        Visit 2 (Date: ...)
                                            Complaints:
                                                ...
                                                ...
                                                ...
                                            Prescribed Medicines:
                                                Paracetamol - 500mg - Duration: 5 days
                                                Amoxicillin - 250mg - Schedule: BD 
                                            Doctor's Advice:
                                                Drink water
                                                Avoid alcohol
                                        Visit 3 (Date: ...)
                                            Complaints:
                                                ...
                                                ...
                                                ...`
                            },
                        ],
                    }],
                }),
            });


            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            let data = await response.json();
            let extractedText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No text extracted.";

            document.getElementById("extractedText").textContent = extractedText;

            let { patientName, latestVisit } = extractPatientDetailsAndVisit(extractedText);
            if (latestVisit) {
                generatePDF(patientName, latestVisit);
            } else {
                alert("No valid prescription data found!");
            }

        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred while processing the image.");
        }
    };
}

function extractPatientDetailsAndVisit(text) {
    let patientMatch = text.match(/Name:\s*(.+)/);
    let patientName = patientMatch ? patientMatch[1].trim() : "Unknown";

    let visits = text.match(/Visit \d+ \(Date: [^)]+\)([\s\S]*?)(?=Visit \d+ \(Date:|$)/g);
    if (!visits || visits.length === 0) return null;

    let latestVisit = visits[visits.length - 1]; // Get the last visit
    let medicines = latestVisit.match(/Prescribed Medicines:\s+([\s\S]*?)(?=Doctor's Advice:|$)/);

    return { patientName, latestVisit: medicines ? formatMedicineData(medicines[1].trim()) : null };

}

function formatMedicineData(medicineText) {
    let lines = medicineText.split("\n").map(line => line.trim()).filter(line => line);
    return lines.join("\n");
}

function generatePDF(patientName, text) {
    let { jsPDF } = window.jspdf;
    let doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.text(`Prescription - ${patientName}`, 20, 20);

    doc.setFont("helvetica", "normal");
    let lines = doc.splitTextToSize(text, 180);
    doc.text(lines, 20, 30);

    let pdfBlob = doc.output("blob");
    let url = URL.createObjectURL(pdfBlob);

    let pdfLink = document.getElementById("pdfLink");
    pdfLink.href = url;
    pdfLink.download = `${patientName.replace(/\s+/g, "_")}_Prescription.pdf`;
    pdfLink.style.display = "block";
}