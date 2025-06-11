import { useState, useRef } from "react";
import {
  TextInput,
  NumberInput,
  Button,
  Group,
  Box,
  Title,
  Textarea,
  ActionIcon,
} from "@mantine/core";
import {
  DatesProvider,
  DatePickerInput,
  TimePicker,
  TimeInput,
} from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useMediaQuery } from "@mantine/hooks";
import { IconClock } from "@tabler/icons-react";
import classes from "../styles/Reservation.module.scss";
import { API_BASE_URL } from "../frontend-config";
//import dajys from "dajys";

type ReservationFormProps = {
  onClose: () => void;
  reservationType: string;
};

function ReservationForm({ onClose, reservationType }: ReservationFormProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [dropdownOpened, setDropdownOpened] = useState(false);

  const smallText = useMediaQuery("(max-width: 650px)");

  let formLabelFontSize = !smallText ? "1.3rem" : "1rem";

  const ref = useRef<HTMLInputElement>(null);

  const pickerControlDropdown = (
    <ActionIcon
      variant="subtle"
      color="gray"
      onClick={() => setDropdownOpened(true)}
    >
      <IconClock size={16} stroke={1.5} />
    </ActionIcon>
  );

  const pickerControlNative = (
    <ActionIcon
      variant="subtle"
      color="gray"
      onClick={() => ref.current?.showPicker()}
    >
      <IconClock size={16} stroke={1.5} />
    </ActionIcon>
  );

  const pickerControl =
    reservationType === "reservation"
      ? pickerControlDropdown
      : pickerControlNative;

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
      date: new Date(),
      time:
        reservationType === "waitlist"
          ? new Date().toLocaleTimeString("en-US", {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
            })
          : null,
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
        value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ? "Invalid email address"
          : null,
      phone: (value: string) => {
        const cleaned = value.replace(/\D/g, ""); // remove non-digit characters
        return value && cleaned.length < 10
          ? "Please enter a valid phone number"
          : null;
      },
      date: (value: any) => (value === null ? "Please select a date" : null),
      time: (value: any) => (value === null ? "Please select a time" : null),
      partySize: (value: number) =>
        value < 1 ? "Party size must be at least 1" : null,
    },
  });

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const response = await fetch(
        reservationType === "reservation"
          ? `${API_BASE_URL}/reservations/create`
          : `${API_BASE_URL}/walkins/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );

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
      <Box className={classes.submittedPopup}>
        <Title order={2}>
          {reservationType === "reservation"
            ? "Reservation Submitted"
            : "Added to Waitlist"}
        </Title>
        <p>
          {reservationType === "reservation"
            ? "Reservation has been submitted"
            : "Customer has been added to waitlist"}{" "}
          successfully!
        </p>
        <button className={classes.popupCloseButton} onClick={onClose}>
          X
        </button>
        <Button
          onClick={() => setSubmitted(false)}
          style={{ marginTop: "60px", bottom: "-16px" }}
        >
          {reservationType === "reservation"
            ? "Make another reservation"
            : "Add to waitlist again"}
        </Button>
      </Box>
    );
  }

  return (
    <Box className={classes.formContainer} mx="auto">
      <Title order={2} className={classes.formTitle}>
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
        role="form"
        aria-label={`${reservationType} form`}
      >
        <div
          className={classes.contactContainer}
          role="group"
          aria-labelledby="contact-info"
        >
          <TextInput
            label="First Name"
            placeholder="First name"
            required
            labelProps={{
              style: {
                textAlign: "flex-start",
                fontSize: formLabelFontSize,
              },
            }}
            classNames={{ input: classes.inputStyles }}
            aria-required="true"
            {...form.getInputProps("firstname")}
          />

          <TextInput
            label="Last Name"
            placeholder="Last name"
            required
            labelProps={{
              style: {
                textAlign: "flex-start",
                fontSize: formLabelFontSize,
              },
            }}
            classNames={{ input: classes.inputStyles }}
            aria-required="true"
            {...form.getInputProps("lastname")}
          />

          {reservationType === "reservation" ? (
            <TextInput
              label="Email"
              placeholder="example@email.com"
              labelProps={{
                style: {
                  textAlign: "flex-start",
                  fontSize: formLabelFontSize,
                },
              }}
              classNames={{ input: classes.inputStyles }}
              aria-required="true"
              {...form.getInputProps("email")}
            />
          ) : null}

          <TextInput
            label="Phone"
            placeholder="Phone number"
            required={reservationType === "waitlist"}
            labelProps={{
              style: {
                textAlign: "flex-start",
                fontSize: formLabelFontSize,
              },
            }}
            classNames={{ input: classes.inputStyles }}
            aria-required={reservationType === "waitlist"}
            {...form.getInputProps("phone")}
          />
        </div>

        <Group role="group" aria-labelledby="date-time-info">
          {reservationType === "reservation" && (
            <DatesProvider settings={{ locale: "en", firstDayOfWeek: 0 }}>
              <DatePickerInput
                label="Date"
                placeholder="Pick a date"
                required
                clearable
                valueFormat="MM/DD/YYYY"
                minDate={new Date()}
                maxDate={
                  new Date(new Date().setMonth(new Date().getMonth() + 3))
                }
                labelProps={{
                  style: {
                    textAlign: "flex-start",
                    fontSize: formLabelFontSize,
                  },
                }}
                classNames={{ input: classes.inputStyles }}
                aria-required="true"
                {...form.getInputProps("date")}
              />
            </DatesProvider>
          )}

          {reservationType === "reservation" ? (
            <TimePicker
              label="Time"
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
              aria-required="true"
              {...form.getInputProps("time")}
            />
          ) : (
            <TimeInput
              label="Time"
              ref={ref}
              rightSection={pickerControl}
              required
              labelProps={{
                style: {
                  textAlign: "flex-start",
                  fontSize: formLabelFontSize,
                },
              }}
              classNames={{ input: classes.inputStyles }}
              aria-required="true"
              {...form.getInputProps("time")}
            />
          )}
        </Group>

        <NumberInput
          label="Party Size"
          placeholder="Number of guests"
          required
          min={1}
          max={20}
          labelProps={{
            style: {
              textAlign: "flex-start",
              fontSize: formLabelFontSize,
            },
          }}
          classNames={{ input: classes.inputStyles }}
          aria-required="true"
          aria-valuemin={1}
          aria-valuemax={20}
          {...form.getInputProps("partySize")}
        />

        <Textarea
          label="Additional comments"
          placeholder="Any additional comments or notes"
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
          aria-label="Additional comments or notes"
          {...form.getInputProps("specialRequests")}
        />

        <div className={classes.submitContainer}>
          <Button
            type="submit"
            loading={loading}
            className={classes.submitButton}
            aria-busy={loading}
            aria-label={
              reservationType === "reservation"
                ? "Submit Reservation"
                : "Add to Waitlist"
            }
          >
            {reservationType === "reservation"
              ? "Submit Reservation"
              : "Add to Waitlist"}
          </Button>
        </div>
      </form>
    </Box>
  );
}

export default ReservationForm;
