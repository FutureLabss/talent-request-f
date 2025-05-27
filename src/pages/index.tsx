// pages/index.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router"; // We need useRouter for redirection
import Nav from "@/components/Nav";
import {
  FiRefreshCw,
  FiSearch,
  // FiTrash2,
  FiEye,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

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

interface User {
  id: string;
  email: string;
  role: string;
}

export default function Home() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true); // New state to manage authentication check loading

  const [requests, setRequests] = useState<TalentRequest[]>([]);
  const [dataLoading, setDataLoading] = useState(true); // Renamed from 'loading' to avoid conflict
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<TalentRequest | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Helper to safely decode token (copied from AuthContext)
  const decodeToken = (jwtToken: string) => {
    if (typeof window === "undefined") {
      return null;
    }
    try {
      if (!jwtToken) {
        return null;
      }
      const parts = jwtToken.split(".");
      if (parts.length !== 3) {
        return null;
      }
      const decoded = JSON.parse(atob(parts[1]));
      return decoded;
    } catch (e) {
      console.error("Error decoding JWT token:", e, "Token:", jwtToken);
      return null;
    }
  };

  // --- Authentication and Redirection Logic ---
  useEffect(() => {
    setAuthLoading(true); // Start authentication check
    if (typeof window !== "undefined") {
      // Ensure localStorage is accessed only in browser
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        const decodedUser = decodeToken(storedToken);
        if (decodedUser && decodedUser.role === "admin") {
          // Check for admin role
          setToken(storedToken);
          setUser({
            id: decodedUser.id,
            email: decodedUser.email,
            role: decodedUser.role,
          });
          setAuthLoading(false); // Auth check complete
          return; // User is authenticated and authorized, proceed
        } else {
          // Token exists but is invalid, or user is not admin
          console.warn(
            "Invalid token or non-admin user. Clearing and redirecting."
          );
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
    }
    // If no token, or invalid token, or not admin, redirect to login
    setAuthLoading(false); // Auth check complete
    router.push("/login");
  }, [router]); // Depend on router to ensure it's available

  // Logout function
  const logout = () => {
    setToken(null);
    setUser(null);
    if (typeof window !== "undefined") {
      // Ensure localStorage is accessed only in browser
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    router.push("/login"); // Redirect to login page
  };

  // Fetch data from your backend API
  const fetchRequests = async () => {
    if (!token || authLoading) {
      // Don't fetch if token is missing or still checking auth
      setDataLoading(false);
      return;
    }

    try {
      setDataLoading(true);
      const response = await fetch(
        "https://talent-backend-o5cb.onrender.com/api/talents",
        {
          headers: {
            Authorization: `Bearer ${token}`, // Send the JWT token
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.error(
            "Unauthorized or Forbidden access to requests. Logging out."
          );
          logout(); // Log out if token is invalid or unauthorized
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch data if auth check is complete and user is authenticated
    if (!authLoading && token) {
      fetchRequests();
    }
  }, [token, authLoading]); // Depend on token and authLoading

  // Filter requests based on search term
  const filteredRequests = requests.filter(
    (request) =>
      request.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.companyEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.professionNeeded.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRequests.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Delete a request - NOW REQUIRES AUTHENTICATION!
  // const deleteRequest = async (id: string) => {
  //   if (!token) {
  //     alert("You are not authenticated to perform this action.");
  //     return;
  //   }
  //   if (window.confirm("Are you sure you want to delete this request?")) {
  //     try {
  //       const response = await fetch(
  //         `http://localhost:5000/api/talents/${id}`,
  //         {
  //           method: "DELETE",
  //           headers: {
  //             Authorization: `Bearer ${token}`, // Send the JWT token
  //           },
  //         }
  //       );

  //       if (!response.ok) {
  //         if (response.status === 401 || response.status === 403) {
  //           alert("You are not authorized to delete this request.");
  //           logout(); // Log out if unauthorized
  //         }
  //         throw new Error(`HTTP error! Status: ${response.status}`);
  //       }

  //       setRequests(requests.filter((request) => request._id !== id));

  //       // Reset to first page if current page would be empty after deletion
  //       if (currentItems.length === 1 && currentPage > 1) {
  //         setCurrentPage(currentPage - 1);
  //       }
  //     } catch (error) {
  //       console.error("Error deleting request:", error);
  //       alert("Failed to delete request. Check console for details.");
  //     }
  //   }
  // };

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

  // Display a loading spinner or message while authentication is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        <p className="ml-4 text-gray-600">Checking authentication...</p>
      </div>
    );
  }

  // If auth check is complete and no user (meaning redirected), this won't even be reached
  // but it's good practice to ensure content only renders if user is available.
  if (!user) {
    return null; // Or a fallback component, though redirection should handle this
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <Nav />
      </div>
      <div className="max-w-7xl mx-auto mt-10">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        {user && ( // Display user info if available
          <p className="text-gray-600 mt-2">
            Welcome back, <span className="font-semibold">{user.email}</span>!
            Your role:{" "}
            <span className="font-semibold text-blue-600">{user.role}</span>
          </p>
        )}
        <p className="text-gray-600 mt-2">
          Manage talent requests and submissions.
        </p>
      </div>
      <div className="max-w-7xl mx-auto mt-10">
        <div className="flex justify-between items-center mb-8">
          <div className="flex space-x-4">
            <button
              onClick={fetchRequests}
              className="flex items-center cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiRefreshCw
                className={`mr-2 ${dataLoading ? "animate-spin" : ""}`} // Use dataLoading here
              />
              Refresh
            </button>
            <button
              onClick={logout} // Add logout button
              className="flex items-center cursor-pointer px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Search and filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center mb-4">
            <div className="relative flex-grow max-w-md">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search requests..."
                className="w-full pl-10 pr-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page when searching
                }}
              />
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {dataLoading ? ( // Use dataLoading here
            <div className="p-8 text-center">
              <div className="animate-pulse flex justify-center">
                <div className="h-8 w-8 bg-blue-600 rounded-full"></div>
              </div>
              <p className="mt-4 text-gray-600">Loading requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">No requests found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Profession
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
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
                    {currentItems.map((request) => (
                      <tr key={request._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            {request.firstName} {request.lastName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {request.companyEmail}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                            {request.professionNeeded}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {request.quantityNeeded}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {formatDate(request.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setIsModalOpen(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 mr-4 cursor-pointer"
                          >
                            <FiEye className="inline mr-1 " /> View
                          </button>
                          {/* <button
                            onClick={() => deleteRequest(request._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FiTrash2 className="inline mr-1" /> Delete
                          </button> */}
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
                    {Math.min(indexOfLastItem, filteredRequests.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">{filteredRequests.length}</span>{" "}
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

                  {/* Page numbers */}
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
                    onClick={() =>
                      paginate(Math.min(totalPages, currentPage + 1))
                    }
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
      </div>

      {/* Request Detail Modal */}
      {isModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop with proper opacity */}
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setIsModalOpen(false)}
          ></div>

          {/* Modal content */}
          <div className="relative z-[101] bg-white rounded-lg shadow-lg p-8 max-w-lg w-full mx-4">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl"
              onClick={() => setIsModalOpen(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Request Details
            </h2>
            <div className="mb-2 text-gray-800">
              <span className="font-semibold ">Name:</span>{" "}
              {selectedRequest.firstName} {selectedRequest.lastName}
            </div>
            <div className="mb-2 text-gray-800">
              <span className="font-semibold ">Email:</span>{" "}
              {selectedRequest.companyEmail}
            </div>
            <div className="mb-2 text-gray-800">
              <span className="font-semibold">Company Website:</span>{" "}
              {selectedRequest.companyWebsite}
            </div>
            <div className="mb-2 text-gray-800">
              <span className="font-semibold">Profession Needed:</span>{" "}
              {selectedRequest.professionNeeded}
            </div>
            <div className="mb-2 text-gray-800">
              <span className="font-semibold">Quantity Needed:</span>{" "}
              {selectedRequest.quantityNeeded}
            </div>
            <div className="mb-2 text-gray-800">
              <span className="font-semibold">Contact Address:</span>{" "}
              {selectedRequest.contactAddress}
            </div>
            <div className="mb-2 text-gray-800">
              <span className="font-semibold">Date:</span>{" "}
              {formatDate(selectedRequest.createdAt)}
            </div>
            <div className="flex justify-end mt-6">
              <button
                className="px-4 py-2 bg-blue-600 cursor-pointer text-white rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
