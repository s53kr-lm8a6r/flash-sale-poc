"use client";

import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useGuestRedirect } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [buyerName, setBuyerName] = useState("");

  useGuestRedirect();

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Login
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Enter your buyer name
          </Typography>
          <TextField
            fullWidth
            label="Buyer name"
            value={buyerName}
            onChange={(e) => setBuyerName(e.target.value)}
          />
        </CardContent>
        <CardActions sx={{ px: 2, pb: 2 }}>
          <Button
            type="button"
            variant="contained"
            onClick={async () => {
              if (!buyerName.trim()) return;
              localStorage.setItem("buyerName", buyerName.trim());
              await fetch("/api/auth", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ buyerName: buyerName.trim() }),
              });
              router.replace("/sales");
            }}
          >
            Continue
          </Button>
        </CardActions>
      </Card>
    </Container>
  );
}
