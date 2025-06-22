import {
  Heading,
  Avatar,
  Box,
  Center,
  Text,
  Stack,
  Button,
  Badge,
  Spinner,
  Progress,
  Image as ChakraImage,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  useDisclosure,
  Textarea,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useGetUsers } from "./../hooks/useGetUsers";
import { logout, login as loginAction } from "../redux/userSlice";
import axios from "axios";
import EditTeacherModal from "./EditTeacherModal"; // Import EditTeacherModal

export default function ProfileCard() {
  const dispatch = useDispatch();
  const [programs, setPrograms] = useState("");
  const [isMe, setIsMe] = useState(false);
  const { id: pathId } = useParams();
  const connectedUser = useSelector((state) => state.user.user);
  const [user, setUser] = useState({});
  const { data: users = [], isLoading } = useGetUsers();
  const { isOpen, onOpen, onClose } = useDisclosure(); // For self-edit modal
  const { isOpen: isAdminEditOpen, onOpen: onAdminEditOpen, onClose: onAdminEditClose } = useDisclosure(); // For admin editing teacher
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    about: "",
    mobileNumber: "",
    oldPassword: "",
    newPassword: "",
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (pathId === connectedUser._id) {
      setUser(connectedUser);
      setIsMe(true);
    } else {
      const temp = users.find((u) => u._id === pathId);
      setUser(temp);
      setIsMe(false);
    }
    setPrograms("");
  }, [pathId, users, connectedUser]);

  useEffect(() => {
    if (user?.programs) {
      let str = "";
      user.programs.forEach((p) => {
        str += `${p} program, `;
      });
      setPrograms(str);
    }
    setFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      about: user.about || "",
      mobileNumber: user.mobileNumber || "",
      oldPassword: "",
      newPassword: "",
    });
    setFile(null);
    setUploadProgress(0);
  }, [user]);
  const handleLogout = async () => {
    await axios
      .post(
        import.meta.env.VITE_API_URL + "/auth/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then(() => {
        dispatch(logout());
        localStorage.removeItem("token");
      });

    navigate("/signin");
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let profilePicUrl = user.profilePic;
      if (file) {
        setUploading(true);
        const form = new FormData();
        form.append("file", file);
        form.append("upload_preset", "react_preset");
        const cloudRes = await axios.post(
          "https://api.cloudinary.com/v1_1/drtmtlnwi/image/upload",
          form,
          {
            onUploadProgress: (progressEvent) => {
              const percent =
                (progressEvent.loaded / progressEvent.total) * 100;
              setUploadProgress(Math.round(percent));
            },
          }
        );
        profilePicUrl = cloudRes.data.secure_url;
        setUploading(false);
      }

      const token = localStorage.getItem("token");
      const response = await axios.post(
        import.meta.env.VITE_API_URL + "/auth/profile-edit",
        { ...formData, profilePic: profilePicUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (formData.newPassword) {
        dispatch(logout());
        return;
      }
      const walletRes = await axios.get(
        import.meta.env.VITE_API_URL + "/wallet",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const userData = { user: response.data.user, ...walletRes.data };
      dispatch(loginAction(userData));
      onClose();
    } catch (error) {
      console.error(error);
      setUploading(false);
    }
  };

  if (isLoading) {
    return (
      <Center w="full" h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <>
      <Center py={6}>
        <Box
          maxW="320px"
          w="full"
          bg="white"
          boxShadow="2xl"
          rounded="lg"
          p={6}
          textAlign="center"
        >
          <Avatar
            size="xl"
            src={user?.profilePic}
            mb={4}
            pos="relative"
            _after={{
              content: '""',
              w: 4,
              h: 4,
              bg: "green.300",
              border: "2px solid white",
              rounded: "full",
              pos: "absolute",
              bottom: 0,
              right: 3,
            }}
          />
          <Heading fontSize="2xl" fontFamily="body">
            {`${user?.firstName} ${user?.lastName}`}
          </Heading>
          <Text fontSize="sm" fontWeight={600} color="gray.500" mb={4}>
            {`@${user?.firstName}_${user?.lastName}`}
          </Text>
          <Text textAlign="center" color="gray.700" px={3}>
            {programs}
            <Text color="blue.400">
              #{user?.subject} {user.role}
            </Text>
          </Text>

          <Stack align="center" justify="center" direction="row" mt={6}>
            {user?.programs?.map((p) => (
              <Badge key={p} px={2} py={1} bg="gray.50" fontWeight="400">
                {p}
              </Badge>
            ))}
          </Stack>
          <Text textAlign="center" color="gray.700" px={3}>
            <Text color="blue.400">{user.about}</Text>
          </Text>
          <Stack align="center" justify="start" direction="row" mt={6}>
            <ChakraImage boxSize="6" src="/assets/icons/email.gif" />
            <Text>{user.email}</Text>
          </Stack>
          <Stack align="center" justify="start" direction="row" mt={6}>
            <ChakraImage boxSize="6" src="/assets/icons/phone.gif" />
            <Text>{user.mobileNumber}</Text>
          </Stack>

          {user?.role === "teacher" && (
            <Stack align="center" justify="start" direction="row" mt={6}>
              {/* Placeholder for an icon if desired */}
              <Text fontWeight="bold" minW="120px">Max Weekly Hours:</Text>
              <Text>{user.max_hours_per_week !== null && user.max_hours_per_week !== undefined ? user.max_hours_per_week : "Not set"}</Text>
            </Stack>
          )}

          {isMe && ( // User viewing their own profile
            <Stack mt={8} direction="row" spacing={4}>
              <Button
                flex={1}
                fontSize="sm"
                rounded="full"
                _focus={{ bg: "gray.300" }}
                onClick={onOpen}
              >
                edit Profile
              </Button>
              <Button
                flex={1}
                fontSize="sm"
                rounded="full"
                bg="red.400"
                color="white"
                boxShadow={
                  "0px 1px 25px -5px rgb(66 153 225 / 48%), 0 10px 10px -5px rgb(66 153 225 / 43%)"
                }
                _hover={{ bg: "red.500" }}
                _focus={{ bg: "red.500" }}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </Stack>
          )}

          {!isMe && connectedUser?.role === 'admin' && user?.role === 'teacher' && (
             <Stack mt={8} direction="row" spacing={4} justify="center">
              <Button
                flex={1}
                fontSize="sm"
                rounded="full"
                colorScheme="purple"
                onClick={onAdminEditOpen}
              >
                Admin Edit Teacher
              </Button>
            </Stack>
          )}
        </Box>
      </Center>

      {/* Modal for user editing their own profile */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Profile</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit}>
            <ModalBody pb={6}>
              <FormControl mb={3}>
                <FormLabel>Profile Picture</FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {uploading && (
                  <Progress
                    mt={2}
                    value={uploadProgress}
                    size="sm"
                    colorScheme="blue"
                  />
                )}
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>First Name</FormLabel>
                <Input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl mb={3}>
                <FormLabel>Last Name</FormLabel>
                <Input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl mb={3}>
                <FormLabel>Email</FormLabel>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>Mobile Number</FormLabel>
                <Input
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl mb={3}>
                <FormLabel>Old Password</FormLabel>
                <InputGroup>
                  <Input
                    name="oldPassword"
                    type={showOldPassword ? "text" : "password"}
                    value={formData.oldPassword}
                    onChange={handleChange}
                  />
                  <InputRightElement h="full">
                    <Button
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      variant="ghost"
                    >
                      {showOldPassword ? <ViewOffIcon /> : <ViewIcon />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <FormControl>
                <FormLabel>New Password</FormLabel>
                <InputGroup>
                  <Input
                    name="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={handleChange}
                  />
                  <InputRightElement h="full">
                    <Button
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      variant="ghost"
                    >
                      {showNewPassword ? <ViewOffIcon /> : <ViewIcon />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              <FormControl mb={3}>
                <FormLabel>About</FormLabel>
                <Textarea
                  name="about"
                  value={formData.about}
                  onChange={handleChange}
                />
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <Button
                isLoading={uploading}
                colorScheme="blue"
                mr={3}
                type="submit"
              >
                Save
              </Button>
              <Button onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Modal for Admin editing a Teacher's max_hours_per_week */}
      {user && connectedUser?.role === 'admin' && user?.role === 'teacher' && !isMe && (
        <EditTeacherModal
          isOpen={isAdminEditOpen}
          onClose={onAdminEditClose}
          teacher={user}
          labels={{ /* Pass appropriate labels if needed, or rely on defaults in EditTeacherModal */
            editTeacher: "Admin Edit Teacher Max Hours",
            maxWeeklyHours: "Max Weekly Hours",
            save: "Save",
            cancel: "Cancel",
          }}
        />
      )}
    </>
  );
}
