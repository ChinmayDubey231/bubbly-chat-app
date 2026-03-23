import Button from "@/components/Button";
import ConversationItem from "@/components/ConversationItem";
import Loading from "@/components/Loading";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { useAuth } from "@/context/authContext";
import {
  getConversations,
  newConversation,
  newMessage,
} from "@/socket/socketEvents";
import { ConversationProps, ResponseProps } from "@/types";
import { verticalScale } from "@/utils/styling";
import { useRouter } from "expo-router";

import * as Icons from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

const Home = () => {
  const { user: currentUser, signOut } = useAuth();
  const router = useRouter();

  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<ConversationProps[]>([]);

  useEffect(() => {
    getConversations(processConversations);
    newConversation(newConversationHandler);
    newMessage(newMessageHandler);

    getConversations(null);

    return () => {
      getConversations(processConversations, true);
      newConversation(newConversationHandler, true);
      newMessage(newMessageHandler, true);
    };
  }, []);

  const newMessageHandler = (res: ResponseProps) => {
    if (res.success) {
      let conversationId = res.data.conversationId;
      setConversations((prev) => {
        let updatedConversations = prev.map((item) => {
          if (item._id === conversationId) item.lastMessage = res.data;
          return item;
        });
        return updatedConversations;
      });
    }
  };

  const processConversations = (res: ResponseProps) => {
    // console.log("Res: ", res);
    if (res.success) {
      setConversations(res.data);
    }
  };

  const newConversationHandler = (res: ResponseProps) => {
    if (res.success && res.data?.isNew) {
      setConversations((prev) => [...prev, res.data]);
    }
  };

  // useEffect(() => {
  //   testSocket(testSocketCallbackHandler);
  //   testSocket(null);

  //   return () => {
  //     testSocket(testSocketCallbackHandler, true);
  //   };
  // });

  // const testSocketCallbackHandler = (data: any) => {
  //   console.log("Got response from testSocket event:", data);
  // };

  // const conversations = [
  //   {
  //     name: "Alice",
  //     type: "direct",
  //     lastMessage: {
  //       senderName: "Alice",
  //       content: "Hey! Are we still on for tonight?",
  //       createdAt: "2025-06-22T18:45:00Z",
  //     },
  //   },
  //   {
  //     name: "Project Team",
  //     type: "group",
  //     lastMessage: {
  //       senderName: "Sarah",
  //       content: "Meeting rescheduled to 3pm tomorrow.",
  //       createdAt: "2025-06-21T14:10:00Z",
  //     },
  //   },
  //   {
  //     name: "Bob",
  //     type: "direct",
  //     lastMessage: {
  //       senderName: "Bob",
  //       content: "Can you send me the notes?",
  //       createdAt: "2025-06-20T09:30:00Z",
  //     },
  //   },
  //   {
  //     name: "Family Group",
  //     type: "group",
  //     lastMessage: {
  //       senderName: "Mom",
  //       content: "Dinner is ready!",
  //       createdAt: "2025-06-19T13:15:00Z",
  //     },
  //   },
  //   {
  //     name: "Charlie",
  //     type: "direct",
  //     lastMessage: {
  //       senderName: "Charlie",
  //       content: "Let's catch up this weekend.",
  //       createdAt: "2025-06-18T17:50:00Z",
  //     },
  //   },
  //   {
  //     name: "College Friends",
  //     type: "group",
  //     lastMessage: {
  //       senderName: "Rahul",
  //       content: "Trip photos uploaded to drive.",
  //       createdAt: "2025-06-17T20:05:00Z",
  //     },
  //   },
  //   {
  //     name: "David",
  //     type: "direct",
  //     lastMessage: {
  //       senderName: "David",
  //       content: "I'll call you in 10 minutes.",
  //       createdAt: "2025-06-16T11:40:00Z",
  //     },
  //   },
  // ];

  let directConversation = conversations
    .filter((item: ConversationProps) => item.type === "direct")
    .sort((a: ConversationProps, b: ConversationProps) => {
      const aDate = a?.lastMessage?.createdAt || a.createdAt;
      const bDate = b?.lastMessage?.createdAt || b.createdAt;

      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });

  let groupConversation = conversations
    .filter((item: ConversationProps) => item.type === "group")
    .sort((a: ConversationProps, b: ConversationProps) => {
      const aDate = a?.lastMessage?.createdAt || a.createdAt;
      const bDate = b?.lastMessage?.createdAt || b.createdAt;

      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });

  return (
    <ScreenWrapper showPattern={true} bgOpacity={0.4}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Typo
              color={colors.neutral200}
              size={19}
              textProps={{ numberOfLines: 1 }}
            >
              Welcome back,{" "}
              <Typo size={20} color={colors.white} fontWeight={"800"}>
                {currentUser?.name}
              </Typo>{" "}
              🤙
            </Typo>
          </View>
          <TouchableOpacity
            style={styles.settingIcon}
            onPress={() => router.push("/(main)/profileModal")}
          >
            <Icons.GearSixIcon
              color={colors.white}
              weight="fill"
              size={verticalScale(22)}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.content}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: spacingY._20 }}
          >
            <View style={styles.navBar}>
              <View style={styles.tabs}>
                <TouchableOpacity
                  onPress={() => setSelectedTab(0)}
                  style={[
                    styles.tabStyle,
                    selectedTab === 0 && styles.activeTabStyle,
                  ]}
                >
                  <Typo>Direct Messages</Typo>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setSelectedTab(1)}
                  style={[
                    styles.tabStyle,
                    selectedTab === 1 && styles.activeTabStyle,
                  ]}
                >
                  <Typo>Groups</Typo>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.conversationList}>
              {selectedTab === 0 &&
                directConversation.map((item: ConversationProps, index) => {
                  return (
                    <ConversationItem
                      item={item}
                      key={index}
                      router={router}
                      showDivider={directConversation.length != index + 1}
                    />
                  );
                })}

              {selectedTab === 1 &&
                groupConversation.map((item: any, index) => {
                  return (
                    <ConversationItem
                      item={item}
                      key={index}
                      router={router}
                      showDivider={directConversation.length != index + 1}
                    />
                  );
                })}

              {!loading &&
                selectedTab === 0 &&
                directConversation.length === 0 && (
                  <Typo style={{ textAlign: "center" }}>
                    You donot have any messages.
                  </Typo>
                )}

              {!loading &&
                selectedTab === 1 &&
                groupConversation.length === 0 && (
                  <Typo style={{ textAlign: "center" }}>
                    You donot have any messages.
                  </Typo>
                )}

              {loading && <Loading />}
            </View>
          </ScrollView>
        </View>
      </View>
      <Button
        style={styles.floatingButton}
        onPress={() =>
          router.push({
            pathname: "/(main)/newConversationModal",
            params: { isGroup: selectedTab },
          })
        }
      >
        <Icons.PlusIcon
          color={colors.black}
          weight="bold"
          size={verticalScale(24)}
        />
      </Button>
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacingX._20,
    gap: spacingY._15,
    paddingTop: spacingY._15,
    paddingBottom: spacingY._20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius._50,
    borderTopRightRadius: radius._50,
    borderCurve: "continuous",
    overflow: "hidden",
    paddingHorizontal: spacingX._20,
  },
  navBar: {
    flexDirection: "row",
    gap: spacingX._15,
    alignItems: "center",
    paddingHorizontal: spacingX._10,
  },
  tabs: {
    flexDirection: "row",
    gap: spacingX._10,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabStyle: {
    paddingVertical: spacingY._10,
    paddingHorizontal: spacingX._20,
    borderRadius: radius.full,
    backgroundColor: colors.neutral100,
  },
  activeTabStyle: {
    backgroundColor: colors.primaryLight,
  },
  conversationList: {
    paddingVertical: spacingY._20,
  },
  settingIcon: {
    padding: spacingY._10,
    backgroundColor: colors.neutral700,
    borderRadius: radius.full,
  },
  floatingButton: {
    height: verticalScale(50),
    width: verticalScale(50),
    borderRadius: 100,
    position: "absolute",
    bottom: verticalScale(30),
    right: verticalScale(30),
  },
});
