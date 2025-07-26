import React from "react"
import { FileText, CheckCircle, AlertCircle, Info } from "lucide-react"

export function PDFUploadGuide() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
      <div className="flex items-start space-x-3">
        <FileText className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-blue-900 mb-3">PDF Upload Guide</h4>

          <div className="space-y-4">
            <div>
              <h5 className="font-medium text-blue-800 mb-2 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                Supported Question Formats
              </h5>
              <div className="text-sm text-blue-700 space-y-1 ml-6">
                <p>
                  • <strong>Questions:</strong> "1. What is...?", "Q2: Define...", "Question 3:"
                </p>
                <p>
                  • <strong>Multiple Choice:</strong> "A) Option 1", "B. Option 2", "C) Option 3 *"
                </p>
                <p>
                  • <strong>Answers:</strong> "Answer: The process...", "Ans: x = 5"
                </p>
                <p>
                  • <strong>Points:</strong> "Points: 2", "[3 marks]", "Type: multiple-choice"
                </p>
              </div>
            </div>

            <div>
              <h5 className="font-medium text-blue-800 mb-2 flex items-center">
                <Info className="h-4 w-4 mr-2 text-blue-600" />
                Tips for Better Results
              </h5>
              <div className="text-sm text-blue-700 space-y-1 ml-6">
                <p>• Use clear numbering for questions (1., 2., Q1:, etc.)</p>
                <p>• Mark correct answers with * or ✓ or "(correct)"</p>
                <p>• Keep consistent formatting throughout the document</p>
                <p>• Ensure text is selectable (not scanned images)</p>
              </div>
            </div>

            <div>
              <h5 className="font-medium text-amber-800 mb-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 text-amber-600" />
                Note
              </h5>
              <p className="text-sm text-amber-700 ml-6">
                After upload, please review and edit the extracted questions as needed. Complex formatting may require
                manual adjustments.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
