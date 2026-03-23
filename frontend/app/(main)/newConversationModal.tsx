import Avatar from "@/components/Avatar";
import BackButton from "@/components/BackButton";
import Button from "@/components/Button";
import Header from "@/components/Header";
import Input from "@/components/Input";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { useAuth } from "@/context/authContext";
import { uploadFileToCloudinary } from "@/services/imageService";
import { getContacts, newConversation } from "@/socket/socketEvents";
import { verticalScale } from "@/utils/styling";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const NewConversationModal = () => {
  const { isGroup } = useLocalSearchParams();
  const isGroupMode = isGroup === "1";
  const router = useRouter();
  const [contacts, setContacts] = useState([]);
  const [groupAvatar, setGroupAvatar] = useState<{ uri: string } | null>(null);
  const [groupName, setGroupName] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);

  const { user: currentUser } = useAuth();

  useEffect(() => {
    getContacts(processGetContacts);
    newConversation(processNewConversation);

    getContacts(null);

    return () => {
      getContacts(processGetContacts, true);
      newConversation(processNewConversation, true);
    };
  }, []);

  const processGetContacts = (res: any) => {
    // console.log("Got Contacts: ", res);
    if (res.success) {
      setContacts(res.data);
    }
  };

  const processNewConversation = (res: any) => {
    console.log("newConversation result: ", res.data.participants);
    setIsLoading(false);
    if (res.success) {
      router.back();
      router.push({
        pathname: "/(main)/conversation",
        params: {
          id: res.data._id,
          name: res.data.name,
          avatar: res.data.avatar,
          type: res.data.type,
          participants: JSON.stringify(res.data.participants),
        },
      });
    } else {
      console.log("Error fetching/creating conversation: ", res.msg);
      Alert.alert("Error", res.msg);
    }
  };

  const toogleParticipant = (user: any) => {
    setSelectedParticipants((prev: any) => {
      if (prev.includes(user.id)) {
        return prev.filter((id: string) => id !== user.id);
      }
      return [...prev, user.id];
    });
  };

  const onSelectUser = (user: any) => {
    if (!currentUser) {
      Alert.alert("Authentication", "Please login to start a conversation");
      return;
    }

    if (isGroupMode) {
      toogleParticipant(user);
    } else {
      newConversation({
        type: "direct",
        participants: [currentUser?.id, user.id],
      });
    }
  };

  const onPickImage = async () => {
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
      setGroupAvatar(result.assets[0]);
    }
  };

  const createGroup = async () => {
    if (!groupName.trim() || !currentUser || selectedParticipants.length < 2)
      return;
    setIsLoading(true);
    try {
      let avatar = null;
      if (groupAvatar) {
        const uploadResult = await uploadFileToCloudinary(
          groupAvatar,
          "group-avatars",
        );
        if (uploadResult.success) avatar = uploadResult.data;
      }

      newConversation({
        type: "group",
        participants: [currentUser.id, ...selectedParticipants],
        name: groupName,
        avatar,
      });
    } catch (error) {
      console.log("Error creating group: ", error);
      Alert.alert("Error ", error?.message);
    }
  };

  // const contacts = [
  //   {
  //     id: "1",
  //     name: "Liam Carter",
  //     avatar: "https://i.pravatar.cc/150?img=11",
  //   },
  //   {
  //     id: "2",
  //     name: "Emma Davis",
  //     avatar: "https://i.pravatar.cc/150?img=12",
  //   },
  //   {
  //     id: "3",
  //     name: "Noah Wilson",
  //     avatar: "https://i.pravatar.cc/150?img=13",
  //   },
  //   {
  //     id: "4",
  //     name: "Olivia Brown",
  //     avatar: "https://i.pravatar.cc/150?img=14",
  //   },
  //   {
  //     id: "5",
  //     name: "William Johnson",
  //     avatar: "https://i.pravatar.cc/150?img=15",
  //   },
  //   {
  //     id: "6",
  //     name: "Ava Martinez",
  //     avatar: "https://i.pravatar.cc/150?img=16",
  //   },
  //   {
  //     id: "7",
  //     name: "James Anderson",
  //     avatar: "https://i.pravatar.cc/150?img=17",
  //   },
  //   {
  //     id: "8",
  //     name: "Sophia Taylor",
  //     avatar: "https://i.pravatar.cc/150?img=18",
  //   },
  //   {
  //     id: "9",
  //     name: "Benjamin Thomas",
  //     avatar: "https://i.pravatar.cc/150?img=19",
  //   },
  //   {
  //     id: "10",
  //     name: "Isabella Moore",
  //     avatar: "https://i.pravatar.cc/150?img=20",
  //   },
  // ];

  return (
    <ScreenWrapper isModal={true}>
      <View style={styles.container}>
        <Header
          title={isGroupMode ? "New Group" : "Select User"}
          leftIcon={<BackButton color={colors.black} />}
        />

        {isGroupMode && (
          <View style={styles.groupInfoContainer}>
            <View style={styles.avatarContainer}>
              <TouchableOpacity onPress={onPickImage}>
                <Avatar
                  uri={groupAvatar?.uri || null}
                  size={100}
                  isGroup={true}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.groupNameContainer}>
              <Input
                placeholder="Group Name"
                value={groupName}
                onChangeText={setGroupName}
              ></Input>
            </View>
          </View>
        )}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contactList}
        >
          {contacts.map((user: any, index) => {
            const isSelected = selectedParticipants.includes(user.id);
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.contactRow,
                  isSelected && styles.selectedContact,
                ]}
                onPress={() => onSelectUser(user)}
              >
                <Avatar size={45} uri={user.avatar} />
                <Typo fontWeight="500">{user.name}</Typo>

                {isGroupMode && (
                  <View style={styles.selectionIndicator}>
                    <View
                      style={[styles.checkbox, isSelected && styles.checked]}
                    ></View>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {isGroupMode && selectedParticipants.length >= 2 && (
          <View style={styles.createGroupButton}>
            <Button
              onPress={createGroup}
              disabled={!groupName.trim()}
              loading={isLoading}
            >
              <Typo fontWeight={"bold"}>Create Group</Typo>
            </Button>
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
};

export default NewConversationModal;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacingX._15,
    flex: 1,
  },
  groupInfoContainer: {
    alignItems: "center",
    marginTop: spacingY._10,
  },
  avatarContainer: {
    marginBottom: spacingY._10,
  },
  groupNameContainer: {
    width: "100%",
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._10,
    paddingVertical: spacingY._5,
  },
  selectedContact: {
    backgroundColor: colors.neutral100,
    borderRadius: radius._15,
  },
  contactList: {
    gap: spacingY._12,
    marginTop: spacingY._10,
    paddingTop: spacingY._10,
    paddingBottom: verticalScale(150),
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  checked: {
    backgroundColor: colors.primary,
  },
  selectionIndicator: {
    marginLeft: "auto",
    marginRight: spacingX._10,
  },
  createGroupButton: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacingX._15,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral200,
  },
});
