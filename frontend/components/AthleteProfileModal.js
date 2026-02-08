/**
 * AthleteProfileModal - Full athlete bio + medal breakdown
 * Opens when clicking an athlete row in AthleteLeaderboardCard.
 * Reads all data from the Athletes table record passed in as a prop.
 */
import { FIELD_IDS } from '../constants';
import { getStringField, getNumberField } from '../helpers';
import { MedalBadge } from './shared';

export function AthleteProfileModal({ record, onClose }) {
  if (!record) return null;

  const name = getStringField(record, FIELD_IDS.ATHLETES.NAME);
  const countryName = getStringField(record, FIELD_IDS.ATHLETES.COUNTRY_NAME);
  const noc = getStringField(record, FIELD_IDS.ATHLETES.NOC_CODE);
  const age = getStringField(record, FIELD_IDS.ATHLETES.CURRENT_AGE);
  const sport = getStringField(record, FIELD_IDS.ATHLETES.SPORT);
  const profileUrl = getStringField(record, FIELD_IDS.ATHLETES.PROFILE_URL);
  const bornDate = getStringField(record, FIELD_IDS.ATHLETES.BORN_DATE);

  const goldCount = getNumberField(record, FIELD_IDS.ATHLETES.GOLD_MEDALS);
  const silverCount = getNumberField(record, FIELD_IDS.ATHLETES.SILVER_MEDALS);
  const bronzeCount = getNumberField(record, FIELD_IDS.ATHLETES.BRONZE_MEDALS);
  const totalCount = getNumberField(record, FIELD_IDS.ATHLETES.TOTAL_MEDALS);

  const goldEvents = getStringField(record, FIELD_IDS.ATHLETES.GOLD_EVENTS);
  const silverEvents = getStringField(record, FIELD_IDS.ATHLETES.SILVER_EVENTS);
  const bronzeEvents = getStringField(record, FIELD_IDS.ATHLETES.BRONZE_EVENTS);

  // Parse comma-separated event names from rollup fields
  const eventList = [];
  if (goldEvents) {
    goldEvents.split(',').forEach((e) => eventList.push({ name: e.trim(), medal: 'gold' }));
  }
  if (silverEvents) {
    silverEvents.split(',').forEach((e) => eventList.push({ name: e.trim(), medal: 'silver' }));
  }
  if (bronzeEvents) {
    bronzeEvents.split(',').forEach((e) => eventList.push({ name: e.trim(), medal: 'bronze' }));
  }

  return (
    <div
      className="fixed inset-0 bg-backdrop flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-lg shadow-lg w-full max-w-lg mx-4 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-light">
          <div>
            <h2 className="text-xl font-semibold text-primary">{name}</h2>
            <p className="text-sm text-muted mt-0.5">
              {countryName || noc}{noc && countryName ? ` \u00B7 ${noc}` : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-raised text-tertiary transition-colors text-lg"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5">
          {/* Bio bar */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {sport && (
              <BioStat label="Sport" value={sport} />
            )}
            {age && (
              <BioStat label="Age" value={age} />
            )}
            {bornDate && (
              <BioStat label="Born" value={bornDate} />
            )}
            {profileUrl && (
              <div>
                <span className="text-muted text-xs uppercase tracking-wide">Profile</span>
                <div>
                  <a
                    href={profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-blue hover:text-blue-blueDark1 transition-colors text-sm"
                  >
                    Olympics.com &#8599;
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Medal summary */}
          <div className="flex items-center gap-4 py-3 px-4 bg-surface-page rounded-lg border border-light">
            <MedalBadge emoji={'\uD83E\uDD47'} count={goldCount} label="Gold" />
            <MedalBadge emoji={'\uD83E\uDD48'} count={silverCount} label="Silver" />
            <MedalBadge emoji={'\uD83E\uDD49'} count={bronzeCount} label="Bronze" />
            <span className="ml-auto font-bold text-lg text-secondary tabular-nums">
              {totalCount} total
            </span>
          </div>

          {/* Event breakdown */}
          {eventList.length > 0 && (
            <div>
              <h3 className="text-xs text-muted uppercase tracking-wide mb-2">Medal Events</h3>
              <div className="space-y-1.5">
                {eventList.map((event, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 py-1.5 px-3 rounded-md border border-light text-sm"
                  >
                    <span>
                      {event.medal === 'gold' ? '\uD83E\uDD47' : event.medal === 'silver' ? '\uD83E\uDD48' : '\uD83E\uDD49'}
                    </span>
                    <span className="text-body">{event.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {eventList.length === 0 && totalCount === 0 && (
            <p className="text-muted text-sm text-center py-4">
              No medals yet this Olympics.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function BioStat({ label, value }) {
  return (
    <div>
      <span className="text-muted text-xs uppercase tracking-wide">{label}</span>
      <div className="text-primary font-medium">{value}</div>
    </div>
  );
}
