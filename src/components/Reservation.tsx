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
// import { DatePicker } from '@mantine/dates';
// import { TimeInput } from '@mantine/dates';
import { useForm } from "@mantine/form";
import classes from "../styles/Reservation.module.scss";

function ReservationForm({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const formLabelFontSize = "1.3rem";

  const form = useForm({
    initialValues: {
      firstname: "",
      lastname: "",
      email: "",
      phone: "",
      date: null,
      time: null,
      partySize: 2,
      specialRequests: "",
    },

    validate: {
      firstname: (value: string) =>
        value.trim().length < 2
          ? "First name must be at least 2 characters"
          : null,
      lastname: (value: string) =>
        value.trim().length < 2
          ? "Last name must be at least 2 characters"
          : null,
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
        onClose();
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
    <Box
      style={{
        maxWidth: "50%",
        height: "80%",
        color: "black",
        backgroundColor: "#e3e6e7",
        boxSizing: "border-box",
        borderRadius: "8px",
        alignContent: "center",
      }}
      mx="auto"
    >
      <Title order={2} mb="md" ta="center" mt="0">
        Make a Reservation
      </Title>

      <button className={classes.closeButton} onClick={onClose}>
        X
      </button>

      <form
        onSubmit={form.onSubmit(handleSubmit)}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
        className={classes.form}
      >
        <div className={classes.contactContainer}>
          <TextInput
            label="First Name"
            placeholder="Your first name"
            required
            mb="md"
            labelProps={{
              style: {
                textAlign: "flex-start",
                fontSize: formLabelFontSize,
              },
            }}
            classNames={{ input: classes.inputStyles }}
            {...form.getInputProps("firstname")}
          />

          <TextInput
            label="Last Name"
            placeholder="Your last name"
            required
            mb="md"
            labelProps={{
              style: {
                textAlign: "flex-start",
                fontSize: formLabelFontSize,
              },
            }}
            classNames={{ input: classes.inputStyles }}
            {...form.getInputProps("lastname")}
          />

          <TextInput
            label="Email"
            placeholder="your@email.com"
            required
            mb="md"
            labelProps={{
              style: {
                textAlign: "flex-start",
                fontSize: formLabelFontSize,
              },
            }}
            classNames={{ input: classes.inputStyles }}
            {...form.getInputProps("email")}
          />

          <TextInput
            label="Phone"
            placeholder="Your phone number"
            required
            mb="md"
            labelProps={{
              style: {
                textAlign: "flex-start",
                fontSize: formLabelFontSize,
              },
            }}
            classNames={{ input: classes.inputStyles }}
            {...form.getInputProps("phone")}
          />
        </div>

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
          labelProps={{
            style: {
              textAlign: "flex-start",
              fontSize: formLabelFontSize,
            },
          }}
          classNames={{ input: classes.inputStyles }}
          {...form.getInputProps("partySize")}
        />

        <Textarea
          label="Additional comments"
          placeholder="Any additional comments or notes"
          mb="md"
          autosize
          minRows={5}
          labelProps={{
            style: {
              textAlign: "flex-start",
              fontSize: formLabelFontSize,
            },
          }}
          classNames={{ input: classes.inputStyles }}
          styles={{
            input: {
              width: "100%",
              padding: 6,
            },
          }}
          style={{ width: "100%" }}
          {...form.getInputProps("specialRequests")}
        />

        <div className={classes.submitContainer}>
          <Button
            type="submit"
            loading={loading}
            className={classes.submitButton}
          >
            Submit Reservation
          </Button>
        </div>
      </form>
    </Box>
  );
}

export default ReservationForm;
