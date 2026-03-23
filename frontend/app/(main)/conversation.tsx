import Avatar from "@/components/Avatar";
import BackButton from "@/components/BackButton";
import Header from "@/components/Header";
import Input from "@/components/Input";
import Loading from "@/components/Loading";
import MessageItem from "@/components/MessageItem";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { useAuth } from "@/context/authContext";
import { uploadFileToCloudinary } from "@/services/imageService";
import { getMessages, newMessage } from "@/socket/socketEvents";
import { MessageProps, ResponseProps } from "@/types";
import { scale, verticalScale } from "@/utils/styling";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams } from "expo-router";
import * as Icons from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const Conversation = () => {
  const { user: currentUser } = useAuth();

  const {
    id: conversationId,
    name,
    participants: stringifiedParticipants,
    avatar,
    type,
  } = useLocalSearchParams();
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<{ uri: string } | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<MessageProps[]>([]);

  const participants = JSON.parse(stringifiedParticipants as string);

  let conversationAvatar = avatar;
  let isDirect = type === "direct";
  const otherParticipant = isDirect
    ? participants.find((p: any) => p._id !== currentUser?.id)
    : null;

  if (isDirect && otherParticipant)
    conversationAvatar = otherParticipant.avatar;

  let conversationName = isDirect ? otherParticipant.name : name;

  // console.log(data);

  useEffect(() => {
    newMessage(newMessageHandler);
    getMessages(messageHandler);

    getMessages({ conversationId });

    return () => {
      newMessage(newMessageHandler, true);
      getMessages(messageHandler, true);
    };
  }, []);

  const newMessageHandler = (res: ResponseProps) => {
    setLoading(false);
    // console.log("Got new message response: ", res);
    if (res.success) {
      if (res.data.conversationId === conversationId) {
        setMessages((prev) => [res.data as MessageProps, ...prev]);
      }
    } else {
      Alert.alert("Error", res.msg);
    }
  };

  const messageHandler = (res: ResponseProps) => {
    if (res.success) setMessages(res.data);
  };

  // const dummyMessages = [
  //   {
  //     id: "msg_10",
  //     sender: {
  //       id: "user_2",
  //       name: "Jane Smith",
  //       avatar: null,
  //     },
  //     content: "That would be really useful!",
  //     createdAt: "10:42 AM",
  //     isMe: false,
  //   },
  //   {
  //     id: "msg_9",
  //     sender: {
  //       id: "me",
  //       name: "Me",
  //       avatar: null,
  //     },
  //     content:
  //       "Yes, I'm thinking about adding message reactions and file sharing.",
  //     createdAt: "10:40 AM",
  //     isMe: true,
  //   },
  //   {
  //     id: "msg_8",
  //     sender: {
  //       id: "user_2",
  //       name: "Jane Smith",
  //       avatar: null,
  //     },
  //     content: "Nice! That would make the chat more interactive.",
  //     createdAt: "10:38 AM",
  //     isMe: false,
  //   },
  //   {
  //     id: "msg_7",
  //     sender: {
  //       id: "me",
  //       name: "Me",
  //       avatar: null,
  //     },
  //     content: "Exactly. Also planning to add unread message counts.",
  //     createdAt: "10:35 AM",
  //     isMe: true,
  //   },
  //   {
  //     id: "msg_6",
  //     sender: {
  //       id: "user_2",
  //       name: "Jane Smith",
  //       avatar: null,
  //     },
  //     content: "That sounds perfect for a real-time app.",
  //     createdAt: "10:32 AM",
  //     isMe: false,
  //   },
  //   {
  //     id: "msg_5",
  //     sender: {
  //       id: "me",
  //       name: "Me",
  //       avatar: null,
  //     },
  //     content: "I'm also optimizing socket listeners to prevent duplicates.",
  //     createdAt: "10:30 AM",
  //     isMe: true,
  //   },
  //   {
  //     id: "msg_4",
  //     sender: {
  //       id: "user_2",
  //       name: "Jane Smith",
  //       avatar: null,
  //     },
  //     content: "Good idea. That can cause serious bugs.",
  //     createdAt: "10:28 AM",
  //     isMe: false,
  //   },
  //   {
  //     id: "msg_3",
  //     sender: {
  //       id: "me",
  //       name: "Me",
  //       avatar: null,
  //     },
  //     content: "Yes, especially with re-renders in React Native.",
  //     createdAt: "10:25 AM",
  //     isMe: true,
  //   },
  //   {
  //     id: "msg_2",
  //     sender: {
  //       id: "user_2",
  //       name: "Jane Smith",
  //       avatar: null,
  //     },
  //     content: "Are you also handling typing indicators?",
  //     createdAt: "10:22 AM",
  //     isMe: false,
  //   },
  //   {
  //     id: "msg_1",
  //     sender: {
  //       id: "me",
  //       name: "Me",
  //       avatar: null,
  //     },
  //     content: "Not yet, but that's next on my list!",
  //     createdAt: "10:20 AM",
  //     isMe: true,
  //   },
  // ];

  const onPickFile = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permission required",
        "Permission to access the media library is required.",
      );
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],

      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setSelectedFile(result.assets[0]);
    }
  };

  const onSend = async () => {
    if (!message.trim() && !selectedFile) return;

    if (!currentUser) return;

    setLoading(true);

    try {
      let attachment = null;
      if (selectedFile) {
        const uploadResult = await uploadFileToCloudinary(
          selectedFile,
          "message-attachments",
        );

        if (uploadResult.success) {
          attachment = uploadResult.data;
        } else {
          setLoading(false);
          Alert.alert("Error", "Could not send the image.");
        }
      }

      newMessage({
        conversationId,
        sender: {
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar,
        },
        content: message.trim(),
        attachment,
      });

      setMessage("");
      setSelectedFile(null);
    } catch (error) {
      console.log("Error sending messages: ", error);
      Alert.alert("Error", "Failed to send the messages");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper showPattern={true} bgOpacity={0.5}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <Header
          style={styles.header}
          leftIcon={
            <View style={styles.headerLeft}>
              <BackButton />
              <Avatar
                size={40}
                uri={conversationAvatar as string}
                isGroup={type === "group"}
              />
              <Typo color={colors.white} fontWeight={"500"} size={22}>
                {conversationName}
              </Typo>
            </View>
          }
          rightIcon={
            <TouchableOpacity style={{ marginBottom: verticalScale(7) }}>
              <Icons.DotsThreeOutlineVerticalIcon
                weight="fill"
                color={colors.white}
              />
            </TouchableOpacity>
          }
        />

        {/*messages */}
        <View style={styles.content}>
          <FlatList
            data={messages}
            inverted={true}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.messagesContent}
            renderItem={({ item }) => (
              <MessageItem item={item} isDirect={isDirect} />
            )}
            keyExtractor={(item) => item.id}
          />
          <View style={styles.footer}>
            <Input
              value={message}
              onChangeText={setMessage}
              containerStyle={{
                paddingLeft: spacingX._10,
                paddingRight: scale(65),
                borderWidth: 0,
              }}
              placeholder="Type message"
              icon={
                <TouchableOpacity style={styles.inputIcon} onPress={onPickFile}>
                  <Icons.PlusIcon
                    color={colors.black}
                    weight="bold"
                    size={verticalScale(22)}
                  />
                  {selectedFile && selectedFile.uri && (
                    <Image
                      source={{ uri: selectedFile.uri }}
                      style={styles.selectedFile}
                    />
                  )}
                </TouchableOpacity>
              }
            />

            <View style={styles.inputRightIcon}>
              <TouchableOpacity style={styles.inputIcon} onPress={onSend}>
                {loading ? (
                  <Loading size="small" color={colors.black} />
                ) : (
                  <Icons.PaperPlaneTiltIcon
                    color={colors.black}
                    weight="bold"
                    size={verticalScale(22)}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default Conversation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacingX._15,
    paddingTop: spacingY._10,
    paddingBottom: spacingY._15,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._12,
  },
  inputRightIcon: {
    position: "absolute",
    right: scale(10),
    top: verticalScale(15),
    paddingLeft: spacingX._12,
    borderLeftWidth: 1.5,
    borderLeftColor: colors.neutral300,
  },
  content: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius._50,
    borderTopRightRadius: radius._50,
    borderCurve: "continuous",
    overflow: "hidden",
    paddingHorizontal: spacingX._15,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    // padding: spacingX._15,
    paddingTop: spacingY._20,
    paddingBottom: spacingY._10,
    gap: spacingY._12,
  },
  footer: {
    paddingTop: spacingY._7,
    paddingBottom: verticalScale(22),
  },
  inputIcon: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    padding: 8,
  },
  plusIcon: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    padding: 8,
  },
  selectedFile: {
    position: "absolute",
    height: verticalScale(38),
    width: verticalScale(38),
    borderRadius: radius.full,
    alignSelf: "center",
  },
});
