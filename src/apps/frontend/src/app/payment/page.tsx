"use client";

import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { getPaymentBaseUrl } from "@/lib/config";

export default function PaymentPage() {
  const params = useSearchParams();
  const router = useRouter();
  const tx = params.get("tx");
  const sale = params.get("sale");
  const [loading, setLoading] = useState(false);

  async function pay() {
    if (!tx) return;
    setLoading(true);
    try {
      await axios.post(`${getPaymentBaseUrl()}/pay`, {
        transactionId: tx,
        quantity: 1,
      });
      alert("Paid. You may close this page.");
    } finally {
      setLoading(false);
      if (sale) router.replace(`/sales/${sale}`);
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Payment
          </Typography>
          <Typography variant="body2">Transaction: {tx}</Typography>
        </CardContent>
        <CardActions sx={{ px: 2, pb: 2 }}>
          <Button
            type="button"
            disabled={loading}
            onClick={pay}
            variant="contained"
          >
            {loading ? "Processing..." : "Pay"}
          </Button>
        </CardActions>
      </Card>
    </Container>
  );
}
