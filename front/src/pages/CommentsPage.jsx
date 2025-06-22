import React, { useState, useEffect, useCallback, useRef } from "react";
import apiClient from "../hooks/apiClient";
import { useSelector } from "react-redux";
import {
  Box,
  Button,
  Container,
  FormControl,
  Heading,
  HStack,
  Spinner,
  Text,
  Textarea,
  useToast,
  VStack,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Flex,
} from "@chakra-ui/react";
// Removed: import { t } from '../utils/translations';
import { withAuthorization } from "../HOC/Protect";

const CommentsPage = () => {
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingComment, setEditingComment] = useState(null);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const cancelRef = useRef();

  const toast = useToast();

  const reduxUser = useSelector((state) => state.user);
  const currentUser = reduxUser?.user;
  const currentLanguage = useSelector((state) => state.language.language);

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get("/comments");
      setComments(response.data.data || []);
    } catch (err) {
      toast({
        title:
          currentLanguage === "fr"
            ? "Erreur lors de la récupération des commentaires."
            : currentLanguage === "ar"
            ? "خطأ في جلب التعليقات."
            : "Error fetching comments.",
        description:
          err.response?.data?.message ||
          (currentLanguage === "fr"
            ? "Impossible de charger les commentaires."
            : currentLanguage === "ar"
            ? "تعذر تحميل التعليقات."
            : "Could not load comments."),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast, currentLanguage]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleCreateComment = async (e, parentId = null) => {
    e.preventDefault();
    const textToSubmit = parentId ? replyTo.text : newCommentText;
    if (!textToSubmit.trim()) {
      toast({
        title:
          currentLanguage === "fr"
            ? "Le texte du commentaire ne peut pas être vide."
            : currentLanguage === "ar"
            ? "نص التعليق لا يمكن أن يكون فارغًا."
            : "Comment text cannot be empty.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { text: textToSubmit };
      if (parentId) {
        payload.parentComment = parentId;
      }
      await apiClient.post("/comments", payload);
      toast({
        title: parentId
          ? currentLanguage === "fr"
            ? "Réponse publiée."
            : currentLanguage === "ar"
            ? "تم نشر الرد."
            : "Reply posted."
          : currentLanguage === "fr"
          ? "Commentaire publié."
          : currentLanguage === "ar"
          ? "تم نشر التعليق."
          : "Comment posted.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setNewCommentText("");
      setReplyTo(null);
      fetchComments();
    } catch (err) {
      toast({
        title: parentId
          ? currentLanguage === "fr"
            ? "Échec de la publication de la réponse."
            : currentLanguage === "ar"
            ? "فشل نشر الرد."
            : "Failed to post reply."
          : currentLanguage === "fr"
          ? "Échec de la publication du commentaire."
          : currentLanguage === "ar"
          ? "فشل نشر التعليق."
          : "Failed to post comment.",
        description: err.response?.data?.message || err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteComment = (commentId) => {
    setCommentToDelete(commentId);
    setIsAlertOpen(true);
  };

  const handleDeleteComment = async () => {
    if (!commentToDelete) return;
    setIsAlertOpen(false);
    setIsSubmitting(true);
    try {
      await apiClient.delete(`/comments/${commentToDelete}`);
      toast({
        title:
          currentLanguage === "fr"
            ? "Commentaire supprimé."
            : currentLanguage === "ar"
            ? "تم حذف التعليق."
            : "Comment deleted.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchComments();
    } catch (err) {
      toast({
        title:
          currentLanguage === "fr"
            ? "Échec de la suppression du commentaire."
            : currentLanguage === "ar"
            ? "فشل حذف التعليق."
            : "Failed to delete comment.",
        description: err.response?.data?.message || err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setCommentToDelete(null);
      setIsSubmitting(false);
    }
  };

  const openReplyForm = (commentId) => {
    setReplyTo({ id: commentId, text: "" });
    setEditingComment(null);
  };

  const openEditForm = (comment) => {
    setEditingComment({ id: comment._id, text: comment.text });
    setReplyTo(null);
  };

  const handleUpdateComment = async (e) => {
    e.preventDefault();
    if (!editingComment || !editingComment.text.trim()) {
      toast({
        title:
          currentLanguage === "fr"
            ? "Le texte du commentaire ne peut pas être vide."
            : currentLanguage === "ar"
            ? "نص التعليق لا يمكن أن يكون فارغًا."
            : "Comment text cannot be empty.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await apiClient.put(`/comments/${editingComment.id}`, {
        text: editingComment.text,
      });
      toast({
        title:
          currentLanguage === "fr"
            ? "Commentaire mis à jour."
            : currentLanguage === "ar"
            ? "تم تحديث التعليق."
            : "Comment updated.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setEditingComment(null);
      fetchComments();
    } catch (err) {
      toast({
        title:
          currentLanguage === "fr"
            ? "Échec de la mise à jour du commentaire."
            : currentLanguage === "ar"
            ? "فشل تحديث التعليق."
            : "Failed to update comment.",
        description: err.response?.data?.message || err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCommentsRecursive = (parentId = null) => {
    return comments
      .filter(
        (comment) =>
          (comment.parentComment?._id || comment.parentComment) === parentId
      )
      .map((comment) => {
        const authorDisplayName = `${comment.author?.firstName} ${comment.author?.lastName}`;
        return (
          <Box
            key={comment._id}
            as="li"
            p={4}
            borderWidth="1px"
            borderColor="gray.200"
            borderRadius="md"
            bg="gray.50"
            ml={parentId ? 6 : 0}
            mt={parentId ? 2 : 0}
            _hover={{ borderColor: "gray.300" }}
          >
            <HStack spacing={3} mb={2} alignItems="center">
              <Text fontWeight="bold" fontSize="sm">
                {authorDisplayName} ({comment.author?.role})
              </Text>
              <Text fontSize="xs" color="gray.500">
                {new Date(comment.date).toLocaleString()}
              </Text>
            </HStack>

            {editingComment?.id === comment._id ? (
              <Box as="form" onSubmit={handleUpdateComment} mt={2}>
                <FormControl>
                  <Textarea
                    value={editingComment.text}
                    onChange={(e) =>
                      setEditingComment({
                        ...editingComment,
                        text: e.target.value,
                      })
                    }
                    rows={3}
                    mb={2}
                    isDisabled={isSubmitting}
                  />
                  <HStack>
                    <Button
                      type="submit"
                      colorScheme="blue"
                      size="sm"
                      isLoading={isSubmitting}
                    >
                      {currentLanguage === "fr"
                        ? "Enregistrer"
                        : currentLanguage === "ar"
                        ? "حفظ"
                        : "Save"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingComment(null)}
                      isDisabled={isSubmitting}
                    >
                      {currentLanguage === "fr"
                        ? "Annuler"
                        : currentLanguage === "ar"
                        ? "إلغاء"
                        : "Cancel"}
                    </Button>
                  </HStack>
                </FormControl>
              </Box>
            ) : (
              <Text mb={2} whiteSpace="pre-wrap">
                {comment.text}
              </Text>
            )}

            {!editingComment?.id || editingComment?.id !== comment._id ? (
              <HStack spacing={2} mt={2}>
                {currentUser &&
                  (currentUser.role === "admin" ||
                    currentUser.role === "coordinator") && (
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => openReplyForm(comment._id)}
                      isDisabled={isSubmitting || !!editingComment}
                    >
                      {currentLanguage === "fr"
                        ? "Répondre"
                        : currentLanguage === "ar"
                        ? "رد"
                        : "Reply"}
                    </Button>
                  )}
                {currentUser && currentUser?._id === comment.author?._id && (
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => openEditForm(comment)}
                    isDisabled={isSubmitting || !!editingComment}
                  >
                    {currentLanguage === "fr"
                      ? "Modifier"
                      : currentLanguage === "ar"
                      ? "تعديل"
                      : "Edit"}
                  </Button>
                )}
                {currentUser &&
                  (currentUser?._id === comment.author?._id ||
                    currentUser.role === "admin") && (
                    <Button
                      size="xs"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => confirmDeleteComment(comment._id)}
                      isDisabled={isSubmitting || !!editingComment}
                    >
                      {currentLanguage === "fr"
                        ? "Supprimer"
                        : currentLanguage === "ar"
                        ? "حذف"
                        : "Delete"}
                    </Button>
                  )}
              </HStack>
            ) : null}

            {replyTo?.id === comment._id &&
              (!editingComment?.id || editingComment?.id !== comment._id) && (
                <Box
                  as="form"
                  onSubmit={(e) => handleCreateComment(e, comment._id)}
                  mt={3}
                  p={3}
                  bg="gray.100"
                  borderRadius="md"
                >
                  <FormControl>
                    <Textarea
                      value={replyTo.text}
                      onChange={(e) =>
                        setReplyTo({ ...replyTo, text: e.target.value })
                      }
                      placeholder={
                        currentLanguage === "fr"
                          ? `Répondre à ${authorDisplayName}...`
                          : currentLanguage === "ar"
                          ? `الرد على ${authorDisplayName}...`
                          : `Replying to ${authorDisplayName}...`
                      }
                      rows={2}
                      mb={2}
                      isDisabled={isSubmitting}
                    />
                    <HStack>
                      <Button
                        type="submit"
                        colorScheme="blue"
                        size="sm"
                        isLoading={isSubmitting}
                      >
                        {currentLanguage === "fr"
                          ? "Publier la réponse"
                          : currentLanguage === "ar"
                          ? "نشر الرد"
                          : "Post Reply"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReplyTo(null)}
                        isDisabled={isSubmitting}
                      >
                        {currentLanguage === "fr"
                          ? "Annuler"
                          : currentLanguage === "ar"
                          ? "إلغاء"
                          : "Cancel"}
                      </Button>
                    </HStack>
                  </FormControl>
                </Box>
              )}

            <Box
              as="ul"
              listStyleType="none"
              pl={0}
              mt={replyTo?.id === comment._id ? 0 : 2}
            >
              {renderCommentsRecursive(comment._id)}
            </Box>
          </Box>
        );
      });
  };

  if (isLoading && !comments.length) {
    return (
      <Flex justifyContent="center" alignItems="center" minH="200px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Container maxW="container.md" py={5}>
      <VStack spacing={6} align="stretch">
        <Heading as="h2" size="lg">
          {currentLanguage === "fr"
            ? "Commentaires"
            : currentLanguage === "ar"
            ? "التعليقات"
            : "Comments"}
        </Heading>

        <Box
          as="form"
          onSubmit={(e) => handleCreateComment(e)}
          p={4}
          borderWidth="1px"
          borderRadius="md"
          shadow="sm"
        >
          <FormControl>
            <Textarea
              id="new-comment"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder={
                currentLanguage === "fr"
                  ? "Écrivez un nouveau commentaire..."
                  : currentLanguage === "ar"
                  ? "اكتب تعليقًا جديدًا..."
                  : "Write a new comment..."
              }
              rows={3}
              mb={3}
              isDisabled={isSubmitting || !!editingComment}
            />
            <Button
              type="submit"
              colorScheme="teal"
              isLoading={isSubmitting}
              isDisabled={!!editingComment}
            >
              {currentLanguage === "fr"
                ? "Publier le commentaire"
                : currentLanguage === "ar"
                ? "نشر التعليق"
                : "Post Comment"}
            </Button>
          </FormControl>
        </Box>

        {isLoading && comments.length > 0 && (
          <Flex justifyContent="center" py={3}>
            <Spinner />
          </Flex>
        )}

        {comments.length === 0 && !isLoading && (
          <Text textAlign="center" p={5} color="gray.500">
            {currentLanguage === "fr"
              ? "Aucun commentaire pour le moment. Soyez le premier à publier !"
              : currentLanguage === "ar"
              ? "لا توجد تعليقات حتى الآن. كن أول من ينشر!"
              : "No comments yet. Be the first to post!"}
          </Text>
        )}
        <Box as="ul" listStyleType="none" p={0} spacing={4}>
          {renderCommentsRecursive(null)}
        </Box>
      </VStack>

      <AlertDialog
        isOpen={isAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsAlertOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {currentLanguage === "fr"
                ? "Supprimer le commentaire"
                : currentLanguage === "ar"
                ? "حذف التعليق"
                : "Delete Comment"}
            </AlertDialogHeader>
            <AlertDialogBody>
              {currentLanguage === "fr"
                ? "Êtes-vous sûr de vouloir supprimer ce commentaire? Cette action est irréversible."
                : currentLanguage === "ar"
                ? "هل أنت متأكد أنك تريد حذف هذا التعليق؟ هذا الإجراء لا يمكن التراجع عنه."
                : "Are you sure you want to delete this comment? This action cannot be undone."}
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsAlertOpen(false)}>
                {currentLanguage === "fr"
                  ? "Annuler"
                  : currentLanguage === "ar"
                  ? "إلغاء"
                  : "Cancel"}
              </Button>
              <Button colorScheme="red" onClick={handleDeleteComment} ml={3}>
                {currentLanguage === "fr"
                  ? "Supprimer"
                  : currentLanguage === "ar"
                  ? "حذف"
                  : "Delete"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
};

export default withAuthorization(CommentsPage, ["admin", "coordinator"]);
