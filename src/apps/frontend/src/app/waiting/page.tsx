"use client";

import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { getSocket } from "@/lib/socket";

export default function WaitingPage() {
  const params = useSearchParams();
  const tx = params.get("tx");
  const sale = params.get("sale");
  const [switched, setSwitched] = useState(false);

  useEffect(() => {
    const s = getSocket();
    const handler = (payload: {
      transactionId: string;
      buyerName: string;
      saleId: string;
    }) => {
      if (payload.transactionId === tx) setSwitched(true);
    };
    s.on("queue_switch", handler);
    return () => {
      s.off("queue_switch", handler);
    };
  }, [tx]);

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Waiting Room
          </Typography>
          <Typography variant="body2">Transaction: {tx}</Typography>
          <Typography variant="body2">
            {switched
              ? "You can proceed to payment."
              : "Waiting for your turn..."}
          </Typography>
        </CardContent>
        {switched ? (
          <CardActions sx={{ px: 2, pb: 2 }}>
            <Button
              component={Link}
              href={`/payment?tx=${tx}&sale=${sale}`}
              variant="contained"
            >
              Go to Payment
            </Button>
          </CardActions>
        ) : null}
      </Card>
    </Container>
  );
}
