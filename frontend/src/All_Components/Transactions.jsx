import { useState, useEffect } from "react";
import Navigation from "./Navigator";
import { ProfileSection } from "./Short_COmponents/Profiles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAuth } from "./screen/AuthContext";
import { toast } from "sonner";
import axios from "axios";

const Transactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const handleViewMessage = (msg) => {
    setMessage(msg);
  };

  useEffect(() => {
      if (!user || !user._id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch payments

        const paymentRes = await axios .get(`${import.meta.env.VITE_BASE_URL}/api/payments/user/${user._id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (!paymentRes.data.success) {
          throw new Error(paymentRes.data.error || "Failed to fetch payments");
        }
        const payments = paymentRes.data.payments || [];

        // Transform payments to match UI structure
        const transformedTransactions = payments.map((payment) => ({
          type: payment.status === "canceled" ? "Refund" : payment.paymentMethod === "credit_card" ? "Payment" : "Deposit",
          amount: payment.amount,
          time: new Date(payment.createdAt).toLocaleString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          }),
          description: ` ${payment.planName} (${payment.creditsPurchased} credits)`,
        }));
        setTransactions(transformedTransactions);
        setTotalPages(Math.ceil(transformedTransactions.length / itemsPerPage));

        // Fetch wallet balance
        const userRes = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/users/user/${user._id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setBalance(userRes.data.user.credits || 0);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        toast.error(err.response?.data?.error || "Failed to fetch transactions or balance");
        setTransactions([]);
        setBalance(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="px-2 sm:px-4 min-h-screen">
      <div className="max-w-7xl mx-auto pb-10">
        <Navigation />
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-2">
            <Card className="w-full rounded-sm shadow-sm border border-gray-200">
              <CardHeader className="border-b bg-white">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl font-bold">Transactions</CardTitle>
                </div>
                <div className="flex items-center gap-4 justify-start">
                  <p className="font-[350] font-sans">You have €{balance.toFixed(2)} in your wallet</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-2 sm:p-4">
                <Table>
                  <TableCaption>A list of your recent Transactions.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Description</TableHead>
                      {/* <TableHead>Payment Id</TableHead> */}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          <Loader2 className="animate-spin h-6 w-6 mx-auto text-primary" />
                        </TableCell>
                      </TableRow>
                    ) : transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          No transactions found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      currentTransactions.map((txn, index) => (
                        <TableRow key={index}>
                          <TableCell>{txn.type}</TableCell>
                          <TableCell>€{txn.amount.toFixed(2)}</TableCell>
                          <TableCell>{txn.time}</TableCell>

                          <TableCell>
                            {txn.description.slice(0, 20)}...
                            <Dialog>
                              <DialogTrigger asChild>
                                <span
                                  className="text-base text-[#3B5EB7] hover:underline cursor-pointer"
                                  onClick={() => handleViewMessage(txn.description)}
                                >
                                  See
                                </span>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                  <DialogDescription>Transaction Details</DialogDescription>
                                </DialogHeader>
                                <p className="text-base font-[350] font-sans">{message}</p>
                              </DialogContent>
                            </Dialog>
                          </TableCell>

                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <div className="mt-2">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(currentPage - 1);
                      }}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        href="#"
                        isActive={currentPage === i + 1}
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(i + 1);
                        }}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  {totalPages > 3 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(currentPage + 1);
                      }}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>

          <div className="lg:col-span-1 max-lg:hidden">
            <ProfileSection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transactions;