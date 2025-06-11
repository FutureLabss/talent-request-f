// components/SubmissionDetailModal.tsx
import React from "react";
import { FiDownload } from "react-icons/fi";

interface TalentRequest {
  _id: string;
  firstName: string;
  lastName: string;
  companyEmail: string;
  companyWebsite: string;
  professionNeeded: string;
  quantityNeeded: number;
  contactAddress: string;
  createdAt: string;
}

interface JobApplication {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  desiredRole: string;
  experience: number;
  portfolio?: string;
  resume: string; // Path to the resume file
  coverLetter?: string;
  createdAt: string;
}

// Union type for requests to handle both in state and modal
type Submission = TalentRequest | JobApplication;

interface SubmissionDetailModalProps {
  submission: Submission;
  onClose: () => void;
}

const SubmissionDetailModal: React.FC<SubmissionDetailModalProps> = ({
  submission,
  onClose,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Function to construct the URL for the resume
  const getResumeUrl = (resumePath: string) => {
    // Assuming your backend serves static files from 'uploads'
    const filename = resumePath.split(/[\\/]/).pop(); // Handles both / and \
    return `https://talent-backend-o5cb.onrender.com/uploads/${filename}`;
  };

  // Custom type guard function to check if a submission is a TalentRequest
  const isTalentRequest = (sub: Submission): sub is TalentRequest => {
    // Check if a property *unique* to TalentRequest exists.
    // 'firstName' is a good candidate because JobApplication uses 'fullName'.
    // Also check its type to be more robust.
    return (
      "firstName" in sub && typeof (sub as TalentRequest).firstName === "string"
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>

      <div className="relative z-[101] bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full mx-4">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          {isTalentRequest(submission)
            ? "Recruiter Request Details"
            : "Job Application Details"}
        </h2>
        {/* Use the custom type guard for conditional rendering */}
        {isTalentRequest(submission) ? (
          // TypeScript now correctly infers 'submission' as TalentRequest here
          <>
            <div className="mb-2 text-gray-800">
              <span className="font-semibold ">Name:</span>{" "}
              {submission.firstName} {submission.lastName}
            </div>
            <div className="mb-2 text-gray-800">
              <span className="font-semibold ">Email:</span>{" "}
              {submission.companyEmail}
            </div>
            <div className="mb-2 text-gray-800">
              <span className="font-semibold">Company Website:</span>{" "}
              {submission.companyWebsite}
            </div>
            <div className="mb-2 text-gray-800">
              <span className="font-semibold">Profession Needed:</span>{" "}
              {submission.professionNeeded}
            </div>
            <div className="mb-2 text-gray-800">
              <span className="font-semibold">Quantity Needed:</span>{" "}
              {submission.quantityNeeded}
            </div>
            <div className="mb-2 text-gray-800">
              <span className="font-semibold">Contact Address:</span>{" "}
              {submission.contactAddress}
            </div>
          </>
        ) : (
          // TypeScript now correctly infers 'submission' as JobApplication here
          <>
            <div className="mb-2 text-gray-800">
              <span className="font-semibold ">Full Name:</span>{" "}
              {submission.fullName}
            </div>
            <div className="mb-2 text-gray-800">
              <span className="font-semibold ">Email:</span> {submission.email}
            </div>
            <div className="mb-2 text-gray-800">
              <span className="font-semibold">Phone Number:</span>{" "}
              {submission.phoneNumber}
            </div>
            {submission.portfolio && (
              <div className="mb-2 text-gray-800">
                <span className="font-semibold">Portfolio:</span>{" "}
                <a
                  href={submission.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {submission.portfolio}
                </a>
              </div>
            )}
            <div className="mb-2 text-gray-800">
              <span className="font-semibold">Years of Experience:</span>{" "}
              {submission.experience}
            </div>
            <div className="mb-2 text-gray-800">
              <span className="font-semibold">Desired Role:</span>{" "}
              {submission.desiredRole}
            </div>
            {submission.coverLetter && (
              <div className="mb-2 text-gray-800">
                <span className="font-semibold">Cover Letter:</span>{" "}
                {submission.coverLetter}
              </div>
            )}
            {/* Resume Viewer and Download Link */}
            <div className="mt-4">
              <h3 className="font-semibold text-gray-800 mb-2">Resume:</h3>
              {submission.resume ? (
                <>
                  <a
                    href={getResumeUrl(submission.resume)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:underline mb-4"
                  >
                    <FiDownload className="mr-1" /> Download Resume
                  </a>
                  <div className="border border-gray-300 rounded-lg overflow-hidden mt-2">
                    <iframe
                      src={getResumeUrl(submission.resume)}
                      title="Job Seeker Resume"
                      width="100%"
                      height="200px" // Adjust height as needed
                      style={{ border: "none" }}
                    >
                      This browser does not support PDFs. Please{" "}
                      <a href={getResumeUrl(submission.resume)}>
                        download the PDF
                      </a>{" "}
                      to view it.
                    </iframe>
                  </div>
                </>
              ) : (
                <p>No resume provided.</p>
              )}
            </div>
          </>
        )}
        <div className="mb-2 text-gray-800 mt-4 border-t pt-4 border-gray-200">
          <span className="font-semibold">Date:</span>{" "}
          {formatDate(submission.createdAt)}
        </div>
        <div className="flex justify-end mt-6">
          <button
            className="px-4 py-2 bg-blue-600 cursor-pointer text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmissionDetailModal;
