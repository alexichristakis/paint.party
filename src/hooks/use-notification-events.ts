import { useEffect } from "react";
import { Notifications } from "react-native-notifications";

export function useNotificationEvents() {
  return useEffect(() => {
    Notifications.registerRemoteNotifications();

    const subscribers = [
      Notifications.events().registerNotificationOpened(
        (notification, complete) => {
          complete();
        }
      ),
      Notifications.events().registerNotificationReceivedForeground(
        (notification, complete) => {
          complete({ badge: false, alert: false, sound: false });
        }
      ),
      Notifications.events().registerNotificationReceivedBackground(
        (notification, complete) => {
          complete({ badge: true, alert: true, sound: true });
        }
      ),
      Notifications.events().registerRemoteNotificationsRegistered(
        ({ deviceToken }) => {
          // console.log(deviceToken);
          // updateUser({ deviceToken });
        }
      ),
      Notifications.events().registerRemoteNotificationsRegistrationFailed(
        event => {
          //   console.log(event.code, event.localizedDescription, event.domain);
        }
      )
    ];
  }, []);
}
