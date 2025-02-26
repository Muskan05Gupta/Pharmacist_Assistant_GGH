# Pharmacist_Assistant_GGH
## Overview

The Pharmacist’s Assistant is an AI-powered tool that automates the process of matching orders against handwritten prescriptions. Using Google Gemini API, it extracts key details from prescription images, such as the doctor’s recommendations, medicines, dosages, and schedules, and then generates an accurate order for the patient.

## Features

AI-Powered Prescription Extraction: Uses Gemini API to accurately extract medicine names, dosages, and schedules from handwritten prescriptions.

Automated Order Creation: Generates structured medicine orders for patients.

User-Friendly Interface: Simple web-based UI for pharmacists to upload prescription images and download generated orders.

PDF Order Generation: Automatically saves extracted prescription details in a PDF format named as PatientName_Prescription.pdf.

## Technologies Used

Frontend: HTML, CSS, JavaScript

Backend: Google Gemini API

Libraries: jsPDF (for PDF generation)

## Setup

Set up your Google Gemini API Key:

Replace the API key in config.js:

const GEMINI_API_KEY = "YOUR_API_KEY_HERE";

## Run the project:

Open index.html in a browser.

## Usage Instructions

Upload Prescription: Click the upload button and select an image.

Extract Details: The system extracts relevant information from the prescription.

Download Order: Click on the Download Order link to get the structured prescription order in PDF format.

## Security & Privacy Considerations

API keys are not included in public repositories. 

No personal health data is stored or shared; processing occurs in real-time.

## Limitations 

May not handle highly illegible handwriting perfectly.

Relies on Gemini API, so internet access is required.
