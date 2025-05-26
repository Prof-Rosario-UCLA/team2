import { useState, useRef } from "react";
import {
  TextInput,
  NumberInput,
  Button,
  Group,
  Box,
  Title,
  Select,
  Textarea,
  ActionIcon,
} from "@mantine/core";
import { DatesProvider, DatePickerInput, TimePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { IconClock } from "@tabler/icons-react";
import classes from "../styles/Reservation.module.scss";
//import dajys from "dajys";

type ReservationFormProps = {
  onClose: () => void;
  reservationType: string;
};

function ReservationForm({ onClose, reservationType }: ReservationFormProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [dropdownOpened, setDropdownOpened] = useState(false);

  const formLabelFontSize = "1.3rem";

  const ref = useRef<HTMLInputElement>(null);

  const pickerControl = (
    <ActionIcon
      variant="subtle"
      color="gray"
      onClick={() => setDropdownOpened(true)}
    >
      <IconClock size={16} stroke={1.5} />
    </ActionIcon>
  );

  const times = Array.from({ length: 21 }, (_, i) => {
    const totalMinutes = 17 * 60 + i * 15; // Start at 5 PM (17:00)
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}:${minutes.toString().padStart(2, "0")}`;
  });

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
      date: (value: any) => (value === null ? "Please select a date" : null),
      time: (value: any) => (value === null ? "Please select a time" : null),
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
        padding: "40px",
        color: "black",
        backgroundColor: "#e3e6e7",
        boxSizing: "border-box",
        borderRadius: "8px",
        alignContent: "center",
        zIndex: 10,
      }}
      mx="auto"
    >
      <Title order={2} mb="md" ta="center" mt="0">
        {reservationType === "reservation"
          ? "Make a Reservation"
          : "Add to Waitlist"}
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
            placeholder="First name"
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
            placeholder="Last name"
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
            placeholder="example@email.com"
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
            placeholder="Phone number"
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

        <Group>
          <DatesProvider settings={{ locale: "en", firstDayOfWeek: 0 }}>
            <DatePickerInput
              label="Date"
              placeholder="Pick a date"
              required
              clearable
              valueFormat="MM/DD/YYYY"
              minDate={new Date()}
              maxDate={new Date(new Date().setMonth(new Date().getMonth() + 3))}
              labelProps={{
                style: {
                  textAlign: "flex-start",
                  fontSize: formLabelFontSize,
                },
              }}
              classNames={{ input: classes.inputStyles }}
              {...form.getInputProps("date")}
            />
          </DatesProvider>

          <TimePicker
            label="Time"
            ref={ref}
            rightSection={pickerControl}
            required
            presets={times}
            format="12h"
            readOnly
            popoverProps={{
              opened: dropdownOpened,
              onChange: (_opened) => !_opened && setDropdownOpened(false),
            }}
            labelProps={{
              style: {
                textAlign: "flex-start",
                fontSize: formLabelFontSize,
              },
            }}
            classNames={{ input: classes.inputStyles }}
            {...form.getInputProps("time")}
          />
        </Group>

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
