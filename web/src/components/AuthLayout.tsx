import type { ReactNode } from "react";
import { Box, Paper, Typography } from "@mui/material";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <Box className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Paper
        elevation={3}
        className="w-full max-w-md p-8 sm:p-10 flex flex-col items-center"
        sx={{ borderRadius: 4 }}
      >
        <Typography variant="h5" component="h1" className="font-bold text-gray-900 mb-2 text-center">
          {title}
        </Typography>
        <Typography variant="body1" className="text-gray-500 text-center mb-6">
          {subtitle}
        </Typography>

        <Box className="w-full" sx={{ mt: 2 }}>
          {children}
        </Box>
      </Paper>
    </Box>
  );
};
