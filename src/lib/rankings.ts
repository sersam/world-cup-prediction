import { sortRanking, type RankingEntry } from "@/lib/scoring";

type UserWithPredictions = {
  id: string;
  nickname: string;
  predictions: { points: number }[];
};

export function buildRanking(users: UserWithPredictions[]): RankingEntry[] {
  return sortRanking(
    users.map((user) => ({
      id: user.id,
      nickname: user.nickname,
      points: user.predictions.reduce((total, prediction) => total + prediction.points, 0),
    })),
  );
}
