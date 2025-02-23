import React from "react";
import logo from "../assets/Logo_FingerCloud-Transparente.fw_.png";
import { motion } from "framer-motion";

const Logo = ({ size = "100px" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex justify-center w-full mb-4"
    >
      <img src={logo} alt="BookingCloud Logo" className="" style={{ width: size, height: "auto" }} />
    </motion.div>
  );
};

export default Logo;
