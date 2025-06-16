import React, { useState, useMemo } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Text,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
} from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useGetUsers } from "../hooks/useGetUsers";
import dayjs from "dayjs";

const labels = {
  student: { en: "Student", fr: "Élève", ar: "تلميذ" },
  comment: { en: "Comment", fr: "Commentaire", ar: "تعليق" },
  date: { en: "Date", fr: "Date", ar: "تاريخ" },
  method: {
    en: "Payment Method",
    fr: "Méthode de paiement",
    ar: "طريقة الدفع",
  },
  amount: { en: "Amount", fr: "Montant", ar: "المبلغ" },
  file: {
    en: "Proof File (Upload)",
    fr: "Fichier justificatif (Téléverser)",
    ar: "ملف الإثبات (تحميل)",
  },
  submit: { en: "Submit", fr: "Soumettre", ar: "إرسال" },
  loadingStudents: {
    en: "Loading students...",
    fr: "Chargement des élèves...",
    ar: "جاري تحميل التلاميذ...",
  },
  loadingProofs: {
    en: "Loading proofs...",
    fr: "Chargement des justificatifs...",
    ar: "جاري تحميل الإثباتات...",
  },
  createBtn: {
    en: "Create Proof",
    fr: "Créer un justificatif",
    ar: "إنشاء إثبات",
  },
  search: { en: "Search", fr: "Recherche", ar: "بحث" },
  tableHeaders: {
    student: { en: "Student", fr: "Élève", ar: "تلميذ" },
    date: { en: "Date", fr: "Date", ar: "تاريخ" },
    method: { en: "Method", fr: "Méthode", ar: "طريقة" },
    amount: { en: "Amount", fr: "Montant", ar: "المبلغ" },
    file: { en: "File", fr: "Fichier", ar: "ملف" },
  },
};

const getAuthConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

const fetchProofs = async () => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_API_URL}/payment-prouve`,
    getAuthConfig()
  );
  return data.data;
};

export default function PaymentProofsPage() {
  const language = useSelector((state) => state.language.language);
  const user = useSelector((state) => state.user.user);
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { data: users, isLoading: loadingUsers } = useGetUsers();

  const { data: proofs = [], isLoading: loadingProofs } = useQuery({
    queryKey: ["paymentProofs"],
    queryFn: fetchProofs,
    staleTime: 1000 * 60 * 5,
  });

  const [formData, setFormData] = useState({
    student: "",
    comment: "",
    date: "",
    method: "",
    amount: "",
    file: "",
  });

  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", "react_preset");

    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/drtmtlnwi/image/upload",
        form,
        {
          onUploadProgress: (e) => {
            const percent = (e.loaded / e.total) * 100;
            setUploadProgress(Math.round(percent));
          },
        }
      );
      setFormData((prev) => ({ ...prev, file: res.data.secure_url }));
      setUploadError(null);
    } catch (err) {
      console.log(err);
      setUploadError("Upload failed. Try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/payment-prouve`,
        formData,
        getAuthConfig()
      );
      toast({
        title: "Success",
        description: "Payment proof created successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setFormData({
        student: "",
        comment: "",
        date: "",
        method: "",
        amount: "",
        file: "",
      });
      setUploadProgress(0);
      setUploadError(null);
      queryClient.invalidateQueries(["paymentProofs"]);
      onClose();
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.error || "Something went wrong.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/payment-prouve/${id}`,
        getAuthConfig()
      );
      toast({
        title: "Deleted",
        description: "Payment proof deleted successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      queryClient.invalidateQueries(["paymentProofs"]);
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.error || "Failed to delete proof.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const sortedFilteredProofs = useMemo(() => {
    const filtered = proofs.filter((p) => {
      const fullName = `${p.student?.firstName ?? ""} ${
        p.student?.lastName ?? ""
      }`.toLowerCase();
      const method = p.method?.toLowerCase();
      return (
        fullName.includes(search.toLowerCase()) ||
        method.includes(search.toLowerCase())
      );
    });

    return filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === "student") {
        aValue = `${a.student?.firstName ?? ""} ${a.student?.lastName ?? ""}`;
        bValue = `${b.student?.firstName ?? ""} ${b.student?.lastName ?? ""}`;
      }

      if (sortField === "date") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortField === "amount") {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [proofs, search, sortField, sortDirection]);

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return (
    <Box p={6}>
      <Button mb={4} bg="primary" color="white" onClick={onOpen}>
        {labels.createBtn[language]}
      </Button>

      <Input
        placeholder={labels.search[language]}
        mb={4}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loadingProofs ? (
        <Spinner />
      ) : (
        <Table variant="striped" colorScheme="blue" size="sm">
          <Thead bg="primary" color="white" p={2}>
            <Tr color="white" p={2}>
              {["student", "date", "method", "amount", "date", "file"].map(
                (field) => (
                  <Th
                    py={2}
                    key={field}
                    onClick={() => handleSort(field)}
                    cursor="pointer"
                    color="white"
                  >
                    {labels.tableHeaders[field][language]}
                    {sortField === field
                      ? sortDirection === "asc"
                        ? " 🔼"
                        : " 🔽"
                      : ""}
                  </Th>
                )
              )}
              {user.role === "admin" && (
                <Th color="white" py={2}>
                  {language === "ar" ? "التفاعل" : "Actions"}
                </Th>
              )}
            </Tr>
          </Thead>
          <Tbody>
            {sortedFilteredProofs.map((p) => (
              <Tr key={p._id}>
                <Td py={4}>{`${p.student?.firstName ?? ""} ${
                  p.student?.lastName ?? ""
                }`}</Td>
                <Td py={4}>{new Date(p.date).toLocaleDateString()}</Td>
                <Td py={4}>{p.method}</Td>
                <Td py={4}>{p.amount}</Td>
                <Td py={4}>{dayjs(p.date).format("YYYY-MM-DD/HH:mm")}</Td>
                <Td py={4}>
                  <a href={p.file} target="_blank" rel="noopener noreferrer">
                    Link
                  </a>
                </Td>
                {user.role === "admin" && (
                  <Td py={4}>
                    <Button
                      size="xs"
                      colorScheme="red"
                      onClick={() => handleDelete(p._id)}
                    >
                      Delete
                    </Button>
                  </Td>
                )}
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="lg"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{labels.createBtn[language]}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {loadingUsers ? (
              <Text textAlign="center">{labels.loadingStudents[language]}</Text>
            ) : (
              <form onSubmit={handleSubmit}>
                <FormControl isRequired mb={4}>
                  <FormLabel>{labels.student[language]}</FormLabel>
                  <Select
                    name="student"
                    value={formData.student}
                    onChange={handleChange}
                    placeholder={labels.student[language]}
                  >
                    {users
                      .filter((u) => u.role === "student")
                      .map((student) => (
                        <option key={student._id} value={student._id}>
                          {`${student.firstName} ${student.lastName}`}
                        </option>
                      ))}
                  </Select>
                </FormControl>

                <FormControl mb={4}>
                  <FormLabel>{labels.comment[language]}</FormLabel>
                  <Textarea
                    name="comment"
                    value={formData.comment}
                    onChange={handleChange}
                  />
                </FormControl>

                <FormControl mb={4}>
                  <FormLabel>{labels.date[language]}</FormLabel>
                  <Input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                  />
                </FormControl>

                <FormControl isRequired mb={4}>
                  <FormLabel>{labels.method[language]}</FormLabel>
                  <Select
                    name="method"
                    value={formData.method}
                    onChange={handleChange}
                    placeholder="--"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="transfer">Transfer</option>
                    <option value="other">Other</option>
                  </Select>
                </FormControl>

                <FormControl isRequired mb={4}>
                  <FormLabel>{labels.amount[language]}</FormLabel>
                  <Input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    min={0}
                  />
                </FormControl>

                <FormControl isRequired mb={6}>
                  <FormLabel>{labels.file[language]}</FormLabel>
                  <Input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={onFileChange}
                  />
                  {uploadProgress > 0 && (
                    <Text mt={1} fontSize="sm">
                      Uploading: {uploadProgress}%
                    </Text>
                  )}
                  {uploadError && (
                    <Text mt={1} fontSize="sm" color="red.500">
                      {uploadError}
                    </Text>
                  )}
                  {formData.file && (
                    <Text mt={1} fontSize="sm" color="green.500">
                      File uploaded successfully.
                    </Text>
                  )}
                </FormControl>

                <Button type="submit" colorScheme="blue" width="full" mb={4}>
                  {labels.submit[language]}
                </Button>
              </form>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
