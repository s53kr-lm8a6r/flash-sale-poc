"use client";

import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Snackbar from "@mui/material/Snackbar";
import Typography from "@mui/material/Typography";
import axios, { AxiosError } from "axios";
import type { Sale } from "common";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getBackendBaseUrl, getTransactionBaseUrl } from "@/lib/config";
import { formatDateTime } from "@/lib/date";

export default function SaleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");
  const buyerName =
    typeof window !== "undefined"
      ? (localStorage.getItem("buyerName") ?? "")
      : "";

  useEffect(() => {
    if (!id) return;
    axios
      .get<Sale>(`${getBackendBaseUrl()}/sales/${id}`)
      .then((res) => setSale(res.data));
  }, [id]);

  async function onBuy() {
    if (!buyerName) {
      router.replace("/login");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${getBackendBaseUrl()}/sales/${id}/eligible`, {
        buyerName,
      });
    } catch (err) {
      if (err instanceof AxiosError) {
        setSnackMsg(err.response?.data.message);
      } else {
        setSnackMsg("Something went wrong.");
      }
      setSnackOpen(true);
      setLoading(false);
      return;
    }
    try {
      const res = await axios.post<{
        transactionId: string;
        state: "payment" | "waiting";
      }>(`${getTransactionBaseUrl()}/buy`, { buyerName });
      if (res.data.state === "payment") {
        router.replace(`/payment?tx=${res.data.transactionId}&sale=${id}`);
      } else {
        router.replace(`/waiting?tx=${res.data.transactionId}&sale=${id}`);
      }
    } finally {
      setLoading(false);
    }
  }

  if (!sale)
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {sale.productName}
          </Typography>
          <Typography variant="body2">Quantity: {sale.productQty}</Typography>
          <Typography variant="body2">
            Start: {formatDateTime(sale.saleStart)}
          </Typography>
          <Typography variant="body2">
            End: {formatDateTime(sale.saleEnd)}
          </Typography>
        </CardContent>
        <CardActions sx={{ px: 2, pb: 2 }}>
          <Button
            type="button"
            disabled={loading}
            onClick={onBuy}
            variant="contained"
          >
            {loading ? "Buying..." : "Buy"}
          </Button>
        </CardActions>
      </Card>
      <Snackbar
        open={snackOpen}
        autoHideDuration={4000}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackOpen(false)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {snackMsg}
        </Alert>
      </Snackbar>
    </Container>
  );
}
