// components/JobSeekerTable.tsx
import React, { useState } from "react";
import {
  FiSearch,
  FiEye,
  FiChevronLeft,
  FiChevronRight,
  //   FiDownload,
} from "react-icons/fi";

// Interface for Job Applications - UPDATED
interface JobApplication {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  desiredRole: string;
  experience: number;
  portfolio?: string;
  resume: string;
  coverLetter?: string;
  createdAt: string;
  type: "job_seeker";
}

interface JobSeekerTableProps {
  applications: JobApplication[];
  onViewDetails: (submission: JobApplication) => void;
  isLoading: boolean;
}

const JobSeekerTable: React.FC<JobSeekerTableProps> = ({
  applications,
  onViewDetails,
  isLoading,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Can be a prop if needed

  // Filter applications based on search term - UPDATED
  const filteredApplications = applications.filter((application) => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    const fullName = application.fullName?.toLowerCase() || "";
    const email = application.email?.toLowerCase() || "";
    const desiredRole = application.desiredRole?.toLowerCase() || "";
    // No need to check for experience as it's a number and not directly searched as text

    return (
      fullName.includes(lowerCaseSearchTerm) ||
      email.includes(lowerCaseSearchTerm) ||
      desiredRole.includes(lowerCaseSearchTerm)
    );
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedItems = filteredApplications.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex items-center">
          <div className="relative flex-grow max-w-md">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search job applications..."
              className="w-full pl-10 pr-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset pagination on search
              }}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center">
          <div className="animate-pulse flex justify-center">
            <div className="h-8 w-8 bg-blue-600 rounded-full"></div>
          </div>
          <p className="mt-4 text-gray-600">Loading job applications...</p>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-gray-600">No job applications found.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Full Name {/* Updated */}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Desired Role {/* Updated */}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Experience (Yrs) {/* Updated */}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedItems.map((application) => (
                  <tr key={application._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {application.fullName} {/* Updated */}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {application.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                        {application.desiredRole} {/* Updated */}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {application.experience} {/* Updated */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {formatDate(application.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => onViewDetails(application)}
                        className="text-blue-600 hover:text-blue-900 mr-4 cursor-pointer"
                      >
                        <FiEye className="inline mr-1" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(indexOfLastItem, filteredApplications.length)}
              </span>{" "}
              of{" "}
              <span className="font-medium">{filteredApplications.length}</span>{" "}
              results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => paginate(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md ${
                  currentPage === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <FiChevronLeft className="inline" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (number) => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === number
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {number}
                  </button>
                )
              )}
              <button
                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md ${
                  currentPage === totalPages
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <FiChevronRight className="inline" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default JobSeekerTable;
