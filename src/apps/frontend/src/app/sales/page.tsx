"use client";

import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import axios from "axios";
import type { Sale } from "common";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getBackendBaseUrl } from "@/lib/config";
import { formatDateTime } from "@/lib/date";
import { getSocket } from "@/lib/socket";

export default function SalesListPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    axios
      .get<Sale[]>(`${getBackendBaseUrl()}/sales`)
      .then((res) => setSales(res.data));
  }, []);

  useEffect(() => {
    const s = getSocket();
    const onConnect = () => setConnected(true);
    const refresh = () => {
      axios
        .get<Sale[]>(`${getBackendBaseUrl()}/sales`)
        .then((res) => setSales(res.data));
    };
    s.on("connect", onConnect);
    s.on("sale_update", refresh);
    s.on("sale_event", refresh);
    return () => {
      s.off("connect", onConnect);
      s.off("sale_update", refresh);
      s.off("sale_event", refresh);
    };
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom>
        Sales {connected ? "(live)" : ""}
      </Typography>
      <Grid container spacing={2}>
        {sales.map((s) => (
          <Grid key={s.id} size={{ xs: 12, sm: 6 }}>
            <Card>
              <CardActionArea component={Link} href={`/sales/${s.id}`}>
                <CardContent>
                  <Typography variant="h6">{s.productName}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Quantity: {s.productQty}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Start: {formatDateTime(s.saleStart)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    End: {formatDateTime(s.saleEnd)}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
