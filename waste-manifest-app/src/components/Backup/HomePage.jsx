import React from 'react';
import {
  Typography, Container, Button,
  Grid, Card, CardContent, CardActions, Box,
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ListAltIcon from '@mui/icons-material/ListAlt';
import BusinessIcon from '@mui/icons-material/Business';
import Header from './Header';
import { useNavigate } from 'react-router-dom';

export default function HomePage({ user, onLogout, onHome }) {
    const navigate = useNavigate();
  return (
    <>
      {/* Header */}
    <Header user={user} onLogout={onLogout} onHome={onHome} />

      {/* Hero Section */}
      <Box sx={{ py: 8, textAlign: 'center', bgcolor: '#f5f5f5', mt: -4 }}>
        <Container maxWidth="md">
          <Typography variant="h3" gutterBottom>
            Digital Waste Manifest Management
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph>
            Create, manage, and track waste manifests seamlessly.
          </Typography>
        </Container>
      </Box>

      {/* Feature Cards */}
      <Container sx={{ py: 6 }}>
        <Box sx={{display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 4}}>
          {[
            {
              icon: <AssignmentIcon fontSize="large" color="primary" />,
              title: "Start New Manifest",
              description: "Begin a new waste manifest and complete required form fields.",
              action: "Create",
              link: "/create"
            },
            {
              icon: <ListAltIcon fontSize="large" color="primary" />,
              title: "View Manifests",
              description: "Access previously submitted manifests and track their status.",
              action: "View",
              link: "/manifests"
            },
            {
              icon: <AssignmentIcon fontSize="large" color="primary" />,
              title: "Manage Manifests",
              description: "Update details of previously submitted manifests.",
              action: "Manage",
              link: "/manifestsedit"
            },
            {
              icon: <BusinessIcon fontSize="large" color="primary" />,
              title: "Manage Entities",
              description: "Update information for waste generators, transporters.",
              action: "Manage",
              link: "/entities"
            }
          ].map((card, i) => (
            <Card key={i} sx={{height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between"}}>
              <CardContent>
                {card.icon}
                <Typography gutterBottom variant="h5">
                  {card.title}
                </Typography>
                <Typography>{card.description}</Typography>
              </CardContent>
              <CardActions>
                <Button variant="contained" fullWidth 
                        sx={{ color: "black", fontWeight: "bold", "&:hover": { backgroundColor: "#0096cc" }}} 
                        onClick={() => navigate(card.link)}>
                  {card.action}
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      </Container>
    </>
  );
}