import Badge from "./Badge";

type CountdownBadgeProps = {
  targetDate: Date;
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export default function CountdownBadge({ targetDate }: CountdownBadgeProps) {
  const today = startOfDay(new Date());
  const target = startOfDay(new Date(targetDate));
  const daysRemaining = Math.round((target.getTime() - today.getTime()) / MS_PER_DAY);

  if (daysRemaining < 0) {
    return <Badge label="Overdue" variant="coral" />;
  }

  if (daysRemaining === 0) {
    return <Badge label="Today" variant="coral" />;
  }

  if (daysRemaining <= 7) {
    return <Badge label={`${daysRemaining} day${daysRemaining === 1 ? "" : "s"} left`} variant="amber" />;
  }

  return <Badge label={`${daysRemaining} days left`} variant="green" />;
}
