'use client';

const GLOSSARY: Record<string, string> = {
  'breeze time': 'The official clocked time for the horse\'s under-tack work, measured from start to finish of the timed distance.',
  '1/8 out': 'The time from the finish of the timed breeze to the 1/8-mile marker during the gallop-out. Measures how quickly the horse decelerates — lower is better.',
  '1/4 out': 'The time from the finish of the timed breeze to the 1/4-mile marker during the gallop-out. A broader measure of sustained effort.',
  'stride length': 'The average distance covered per stride during the breeze, measured in feet. Longer strides generally indicate greater efficiency and natural athleticism.',
  'deceleration': 'How much the horse slows down through the gallop-out after the timed breeze. Lower values mean the horse maintained speed longer — a sign of stamina.',
  'gallop-out': 'The distance a horse continues running after the timed portion of the breeze. Analyzed for deceleration patterns and sustained effort.',
  'track variant': 'An adjustment factor for the speed of the racing surface on a given day and set. Conditions can shift in either direction. ThoroughByte normalizes for both.',
  'session depth': 'The position of a horse\'s breeze within the day\'s schedule. Surface conditions shift as sessions progress. The model accounts for this.',
  'cohort': 'The comparison group for scoring and ranking. Defined by sex (colts or fillies) and breeze distance (1/8 or 1/4 mile) within the same sale.',
  'btw': 'Black-Type Winner — the horse\'s dam has produced at least one stakes winner (bold in the catalog).',
  'btp': 'Black-Type Placed — the horse\'s dam has produced at least one stakes-placed runner.',
  'btprod': 'Black-Type Producer — the horse\'s dam has produced a horse that itself produced a stakes winner.',
  'value flag': 'An algorithmic marker indicating the model\'s athletic rating significantly exceeds the horse\'s expected market price, based on historical consignor and sire median sale data.',
};

interface TooltipProps {
  term: string;
  children?: React.ReactNode;
}

export default function Tooltip({ term, children }: TooltipProps) {
  const definition = GLOSSARY[term.toLowerCase()];
  if (!definition) {
    return <>{children || term}</>;
  }

  return (
    <span className="tb-tooltip">
      {children || term}
      <span className="tb-tooltip-text">{definition}</span>
    </span>
  );
}
