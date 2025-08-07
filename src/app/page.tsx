"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Shield,
  CreditCard,
  PiggyBank,
  TrendingUp,
  Users,
  Star,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

const Page = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const fadeInLeft = {
    initial: { opacity: 0, x: -60 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6 },
  };

  const fadeInRight = {
    initial: { opacity: 0, x: 60 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6 },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardHover = {
    scale: 1.05,
    transition: { duration: 0.2 },
  };
  const rates = [
    {
      title: "Savings",
      rate: "3.75%",
      apy: "APY",
      description: "High-yield savings account with competitive rates",
    },
    {
      title: "Checking",
      rate: "3.65%",
      apy: "APY on balances",
      description: "Earn while you spend with our rewards checking",
    },
    {
      title: "Certificate",
      rate: "4.00%",
      apy: "APY",
      description: "Secure your future with guaranteed returns",
    },
    {
      title: "Auto Loans",
      rate: "15.49%",
      apy: "APR",
      description: "Get moving with competitive auto financing",
    },
  ];

  const services = [
    {
      icon: <CreditCard className="h-12 w-12 text-primary" />,
      title: "Payment Accounts",
      description: "Seamless payment solutions for all your needs",
    },
    {
      icon: <Shield className="h-12 w-12 text-primary" />,
      title: "Credit Cards",
      description: "Flexible credit options with great rewards",
    },
    {
      icon: <TrendingUp className="h-12 w-12 text-primary" />,
      title: "Loans",
      description: "Personal and business loans to help you grow",
    },
    {
      icon: <PiggyBank className="h-12 w-12 text-primary" />,
      title: "Business Banking",
      description: "Comprehensive solutions for your business",
    },
    {
      icon: <Users className="h-12 w-12 text-primary" />,
      title: "Wealth Builder",
      description: "Investment strategies for long-term growth",
    },
    {
      icon: <Star className="h-12 w-12 text-primary" />,
      title: "About Finova",
      description: "Learn more about our commitment to excellence",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <motion.header
        className="border-b bg-primary text-primary-foreground"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-white rounded flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xl font-bold">Finova Bright Bank</span>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="hover:text-primary-foreground/80">
                HOME
              </a>
              <a href="#" className="hover:text-primary-foreground/80">
                SAVE
              </a>
              <a href="#" className="hover:text-primary-foreground/80">
                BORROW
              </a>
              <a href="#" className="hover:text-primary-foreground/80">
                HEALTH & MORE
              </a>
              <a href="#" className="hover:text-primary-foreground/80">
                SERVICES
              </a>
              <a href="#" className="hover:text-primary-foreground/80">
                LOANS & PLAN
              </a>
              <a href="#" className="hover:text-primary-foreground/80">
                RESOURCES
              </a>
            </nav>
            <div className="flex items-center space-x-2">
              <Button asChild variant="secondary" size="sm">
                <Link href="/login">LOGIN</Link>
              </Button>
              {/* <Button
                variant="outline"
                size="sm"
                className="border-white text-primary hover:bg-white hover:text-primary"
              >
                OPEN ACCOUNT
              </Button> */}
            </div>
          </div>
        </div>
      </motion.header>

      <section className="relative bg-gradient-to-r from-primary/90 to-primary text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <motion.div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{ backgroundImage: "url('/feature.jpg')" }}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2 }}
        ></motion.div>
        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <motion.div
            className="max-w-2xl"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.h1
              className="text-4xl md:text-6xl font-bold mb-6"
              variants={fadeInUp}
            >
              Finova Bright Bank
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl mb-8 opacity-90"
              variants={fadeInUp}
            >
              We&apos;re looking differently. We believe that a better tomorrow
              starts today. Discover a digital experience every step of the way.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              variants={fadeInUp}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90"
                >
                  <Link href="/login">JOIN NOW</Link>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-primary hover:bg-white hover:text-primary"
                >
                  <Link href="/login">LEARN MORE</Link>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <motion.section
        className="py-16 bg-muted/50"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial="initial"
              whileInView="animate"
              variants={staggerContainer}
              viewport={{ once: true }}
            >
              <motion.h2
                className="text-2xl font-bold text-primary mb-6"
                variants={fadeInLeft}
              >
                BLUE RATES
              </motion.h2>
              <motion.div
                className="grid sm:grid-cols-2 gap-4"
                variants={staggerContainer}
              >
                {rates.map((rate, index) => (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    whileHover={cardHover}
                  >
                    <Card className="text-center cursor-pointer">
                      <CardHeader className="pb-2">
                        <div className="text-sm font-medium text-muted-foreground">
                          {rate.title}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-primary">
                          {rate.rate}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {rate.apy}
                        </div>
                        <p className="text-xs mt-2">{rate.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
            <motion.div
              initial="initial"
              whileInView="animate"
              variants={staggerContainer}
              viewport={{ once: true }}
            >
              <motion.h2
                className="text-2xl font-bold text-primary mb-6"
                variants={fadeInRight}
              >
                BLUE MEMBER CARE
              </motion.h2>
              <motion.div className="space-y-4" variants={staggerContainer}>
                <motion.div variants={fadeInUp} whileHover={cardHover}>
                  <Card className="p-6 cursor-pointer">
                    <h3 className="font-semibold mb-2">24/7 Member Support</h3>
                    <p className="text-sm text-muted-foreground">
                      Get help whenever you need it with our round-the-clock
                      support team.
                    </p>
                  </Card>
                </motion.div>
                <motion.div variants={fadeInUp} whileHover={cardHover}>
                  <Card className="p-6 cursor-pointer">
                    <h3 className="font-semibold mb-2">Fraud Protection</h3>
                    <p className="text-sm text-muted-foreground">
                      Advanced security measures to keep your accounts safe and
                      secure.
                    </p>
                  </Card>
                </motion.div>
                <motion.div variants={fadeInUp} whileHover={cardHover}>
                  <Card className="p-6 cursor-pointer">
                    <h3 className="font-semibold mb-2">Mobile Banking</h3>
                    <p className="text-sm text-muted-foreground">
                      Manage your finances on the go with our award-winning
                      mobile app.
                    </p>
                  </Card>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <motion.section
        className="py-16 bg-primary text-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4 text-center">
          <motion.h2
            className="text-3xl font-bold mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            How Can We Help You Today?
          </motion.h2>
          <motion.div
            className="grid md:grid-cols-3 lg:grid-cols-6 gap-8"
            initial="initial"
            whileInView="animate"
            variants={staggerContainer}
            viewport={{ once: true }}
          >
            {services.map((service, index) => (
              <motion.div
                key={index}
                className="text-center"
                variants={fadeInUp}
                whileHover={{
                  scale: 1.1,
                  transition: { duration: 0.2 },
                }}
              >
                <motion.div
                  className="bg-white rounded-full p-6 mx-auto mb-4 w-24 h-24 flex items-center justify-center cursor-pointer"
                  whileHover={{
                    rotate: [0, -10, 10, -10, 0],
                    transition: { duration: 0.5 },
                  }}
                >
                  {service.icon}
                </motion.div>
                <h3 className="font-semibold mb-2">{service.title}</h3>
                <p className="text-sm opacity-90">{service.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        className="py-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <motion.div
              initial="initial"
              whileInView="animate"
              variants={staggerContainer}
              viewport={{ once: true }}
            >
              <motion.div variants={fadeInLeft}>
                <Badge variant="secondary" className="mb-4">
                  GET $300*
                </Badge>
              </motion.div>
              <motion.h2
                className="text-3xl font-bold mb-4"
                variants={fadeInLeft}
              >
                With a Checking Account Built for You
              </motion.h2>
              <motion.p
                className="text-muted-foreground mb-6"
                variants={fadeInLeft}
              >
                For a limited time, get $300 when you open a new Blue checking
                account. *See below* for how important also does not.
              </motion.p>
              <motion.div
                variants={fadeInLeft}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button className="bg-primary hover:bg-primary/90">
                  MORE
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </motion.div>
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="rounded-lg shadow-lg w-full h-80 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/feature.jpg')" }}
                role="img"
                aria-label="Happy customer using laptop"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              ></motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <motion.section
        className="py-16 bg-muted/50"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4 text-center">
          <motion.h2
            className="text-3xl font-bold mb-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            START BUILDING YOUR FINANCIAL STRENGTH
          </motion.h2>
          <motion.div
            className="grid md:grid-cols-3 gap-8 mt-12"
            initial="initial"
            whileInView="animate"
            variants={staggerContainer}
            viewport={{ once: true }}
          >
            {[
              {
                gradient: "from-primary to-primary/80",
                image: "8554477.jpg",
                title: "The Checklist: 5 Things to Remember",
                category: "RESOURCES",
                description:
                  "Use resources to solidify understanding—all you have what you need to learn, and what builds your financial habits based on what every society",
              },
              {
                gradient: "from-blue-500 to-blue-700",
                image: "1116302.jpg",
                title: "Finova Bright Secured Credit Card",
                category: "CREDIT CARDS",
                description:
                  "Build credit responsibly with our secured credit card designed to help you establish a positive credit history.",
              },
              {
                gradient: "from-green-500 to-green-700",
                image: "unsplash.jpg",
                title: "Building Stronger Communities",
                category: "COMMUNITY",
                description:
                  "Discover how Finova Bright Bank is committed to strengthening communities through financial education and support.",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.2 },
                }}
              >
                <Card className="relative overflow-hidden cursor-pointer">
                  <motion.div
                    className="aspect-video relative"
                    style={{
                      backgroundImage: `url('/${item.image}')`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    }}
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-80`}
                    ></div>
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="font-bold">{item.title}</h3>
                      <div className="flex items-center mt-2">
                        <span className="text-sm">{item.category}</span>
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        className="py-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4 text-center">
          <motion.h2
            className="text-3xl font-bold mb-12 text-primary"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Hear From Our Customers
          </motion.h2>
          <motion.div
            className="max-w-2xl mx-auto"
            initial="initial"
            whileInView="animate"
            variants={staggerContainer}
            viewport={{ once: true }}
          >
            <motion.blockquote className="text-lg mb-6" variants={fadeInUp}>
              &ldquo;I am impressed with the customer service and speed of
              payout.&rdquo;
            </motion.blockquote>
            <motion.div
              className="flex justify-center mb-4"
              variants={fadeInUp}
            >
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1, duration: 0.3 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.2 }}
                >
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                </motion.div>
              ))}
            </motion.div>
            <motion.p className="font-semibold" variants={fadeInUp}>
              Ralph Morris
            </motion.p>
          </motion.div>
        </div>
      </motion.section>

      <motion.footer
        className="bg-primary text-white py-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-xl mb-6">
                Building Strength Together
              </h3>
              <p className="text-sm opacity-90 mb-6">
                Finova Bright exists to build member value when they might
                discover some value that are important to their goals. Whether
                building financial security or helping more achieve a lifestyle
                of generosity—we&apos;re here to help advance what&apos;s
                important to you.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">About Finova</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:underline">
                    Who We Are
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    News
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Investor Relations
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Disclosures</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:underline">
                    Terms of Use
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Accessibility
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Security
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Member Services</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>Live Member Support</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>Member Service</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>Lost My Card</span>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-6 w-6" />
                  <span className="font-bold">Finova Bright</span>
                </div>
                <p className="text-xs opacity-75">
                  The Finova Bright Central Credit Union Serving Times Grand
                  Rapids, Kalamazoo, Michigan Georgia Islands
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/20 mt-12 pt-8 text-center">
            <div className="flex justify-center items-center space-x-8 mb-4">
              <div className="bg-white p-2 rounded">
                <div className="text-primary font-bold text-xs">FDIC</div>
              </div>
              <div className="bg-white p-2 rounded">
                <div className="text-primary font-bold text-xs">
                  EQUAL HOUSING
                </div>
              </div>
              <div className="bg-white p-2 rounded">
                <div className="text-primary font-bold text-xs">NCUA</div>
              </div>
            </div>
            <p className="text-xs opacity-75">
              © 2024 Finova Bright Bank. All rights reserved. Member FDIC. Equal
              Housing Lender.
            </p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

export default Page;
