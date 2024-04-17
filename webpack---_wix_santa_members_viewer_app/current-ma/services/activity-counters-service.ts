import { getActivityCounters } from '@wix/ambassador-members-v1-activity-counter/build/cjs/http.impl';
import {
  IHttpClient,
  IPlatformServices,
  ViewerScriptFlowAPI,
} from '@wix/yoshi-flow-editor';
import { getNumberOfUnseenNotificationsActivityCounter } from '../../services/ping-feed-service';

interface Request {
  memberId: string;
  loggedIn: boolean;
  httpClient: IHttpClient;
  biService: IPlatformServices['bi'];
  flowAPI: ViewerScriptFlowAPI;
}
export async function getMemberActivityCounters({
  memberId,
  loggedIn,
  httpClient,
  biService,
  flowAPI,
}: Request) {
  try {
    const [activityCountersResponse, numberOfUnseenActivityCounter] =
      await Promise.all([
        httpClient.request(getActivityCounters({ memberId })),
        loggedIn
          ? getNumberOfUnseenNotificationsActivityCounter({
              httpClient,
              metaSiteId: biService?.bi?.metaSiteId,
              memberId,
              flowAPI,
            })
          : null,
      ]);

    const activityCounters =
      activityCountersResponse?.data?.activityCounters || [];

    if (numberOfUnseenActivityCounter) {
      activityCounters.push(numberOfUnseenActivityCounter);
    }

    const apps = activityCounters.map((activityCounter) => ({
      appDefId: activityCounter.appId,
      numbers: activityCounter.counters?.reduce(
        (
          acc: Record<string, { public?: boolean; count?: number }>,
          counter,
        ) => {
          acc[counter.key!] = {
            public: counter.public,
            count: counter.count,
          };
          return acc;
        },
        {},
      ),
    }));

    return apps;
  } catch (error) {
    flowAPI.errorMonitor?.captureException(error as Error);
    return [];
  }
}

export type MemberActivityCounters = Awaited<
  ReturnType<typeof getMemberActivityCounters>
>;
