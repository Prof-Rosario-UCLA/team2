import React, { useState } from "react";
import {
  TextInput,
  NumberInput,
  Button,
  Group,
  Box,
  Title,
  Select,
  Textarea,
} from "@mantine/core";
import { useForm } from "@mantine/form";

function ReservationForm() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      date: null,
      time: null,
      partySize: 2,
      specialRequests: "",
    },

    validate: {
      name: (value: string) =>
        value.trim().length < 2 ? "Name must be at least 2 characters" : null,
      email: (value: string) =>
        /^\S+@\S+$/.test(value) ? null : "Invalid email",
      phone: (value: string) =>
        value.trim().length < 10 ? "Please enter a valid phone number" : null,
      //   date: (value) => (value === null ? 'Please select a date' : null),
      //   time: (value) => (value === null ? 'Please select a time' : null),
      partySize: (value: number) =>
        value < 1 ? "Party size must be at least 1" : null,
    },
  });

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        form.reset();
        setSubmitted(true);
      } else {
        const error = await response.json();
        console.error("Submission error:", error);
        // Handle error
      }
    } catch (error) {
      console.error("Submission error:", error);
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Box style={{ maxWidth: 500 }} mx="auto" my="xl">
        <Title order={2}>Reservation Submitted!</Title>
        <p>
          Thank you for your reservation. We'll contact you shortly to confirm.
        </p>
        <Button onClick={() => setSubmitted(false)}>
          Make Another Reservation
        </Button>
      </Box>
    );
  }

  return (
    <Box style={{ maxWidth: 500, color: "black" }} mx="auto" my="xl">
      <Title order={2} mb="md">
        Make a Reservation
      </Title>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          label="Name"
          placeholder="Your full name"
          required
          mb="md"
          {...form.getInputProps("name")}
        />

        <TextInput
          label="Email"
          placeholder="your@email.com"
          required
          mb="md"
          {...form.getInputProps("email")}
        />

        <TextInput
          label="Phone"
          placeholder="Your phone number"
          required
          mb="md"
          {...form.getInputProps("phone")}
        />

        {/* <Group grow mb="md">
          <DatePicker
            label="Date"
            placeholder="Select date"
            required
            {...form.getInputProps('date')}
          />
          
          <TimeInput
            label="Time"
            placeholder="Select time"
            required
            {...form.getInputProps('time')}
          />
        </Group> */}

        <NumberInput
          label="Party Size"
          placeholder="Number of guests"
          required
          min={1}
          max={20}
          mb="md"
          {...form.getInputProps("partySize")}
        />

        <Textarea
          label="Special Requests"
          placeholder="Any special requests or notes"
          mb="xl"
          {...form.getInputProps("specialRequests")}
        />

        <Group justify="flex-end">
          <Button type="submit" loading={loading}>
            Submit Reservation
          </Button>
        </Group>
      </form>
    </Box>
  );
}

export default ReservationForm;
