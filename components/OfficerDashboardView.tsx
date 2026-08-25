import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ClipboardList,
  AlertTriangle,
  BarChart3,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Send,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { UIContent, Language, DistrictAggregate, CommunityPost, CommunityReply, OfficerRecord } from '../types';
import { fetchDistrictAggregate } from '../services/outbreakService';
import { fetchDistrictPosts, fetchReplies, postReply, isFirebaseConfigured } from '../services/communityService';

interface OfficerDashboardViewProps {
  content: UIContent;
  lang: Language;
  officer: OfficerRecord;
}

const OfficerDashboardView: React.FC<OfficerDashboardViewProps> = ({ content, lang, officer }) => {
  const isOdia = lang === Language.ODIA;
  // Officers don't have a farm profile — default the district to their assigned one.
  const [district, setDistrict] = useState(officer.district || '');
  const [aggregate, setAggregate] = useState<DistrictAggregate | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replies, setReplies] = useState<Record<string, CommunityReply[]>>({});
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const configured = isFirebaseConfigured();

  const load = async (d: string) => {
    const dd = d.trim();
    if (!configured || !dd) return;
    setLoading(true);
    try {
      const [agg, ps] = await Promise.all([fetchDistrictAggregate(dd), fetchDistrictPosts(dd)]);
      setAggregate(agg);
      setPosts(ps);
      setExpandedId(null);
      setReplies({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (district) load(district);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleExpand = async (postId: string) => {
    if (expandedId === postId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(postId);
    setReplyText('');
    if (!replies[postId]) {
      const data = await fetchReplies(postId);
      setReplies((prev) => ({ ...prev, [postId]: data }));
    }
  };

  const handleOfficerReply = async (postId: string) => {
    if (!replyText.trim()) return;
    setReplyingTo(postId);
    const officerLabel = isOdia ? `KVK ଅଫିସର୍ · ${district.trim()}` : `KVK Officer · ${district.trim()}`;
    try {
      await postReply(postId, replyText.trim(), officerLabel, 'officer');
      setReplyText('');
      const data = await fetchReplies(postId);
      setReplies((prev) => ({ ...prev, [postId]: data }));
    } finally {
      setReplyingTo(null);
    }
  };

  if (!configured) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-10">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-2xl p-5 flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className={`text-sm text-amber-800 dark:text-amber-300 ${isOdia ? 'font-odia' : ''}`}>{content.communityNotConfigured}</p>
        </div>
      </div>
    );
  }

  const sortedDiseases: [string, number][] = aggregate
    ? (Object.entries(aggregate.diseaseCounts) as [string, number][]).sort((a, b) => b[1] - a[1])
    : [];
  const maxCount: number = sortedDiseases.length ? sortedDiseases[0][1] : 1;

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-24">
      {/* Officer identity banner */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl px-4 py-3 mb-4 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
        <p className={`text-xs text-indigo-800 dark:text-indigo-300 ${isOdia ? 'font-odia' : ''}`}>
          {content.officerLoggedInAs} · {officer.name || officer.email}
        </p>
      </div>

      <div className="flex gap-2 mb-5">
        <input
          type="text"
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load(district)}
          placeholder={content.farmProfileDistrict}
          className="flex-1 border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm"
        />
        <button
          onClick={() => load(district)}
          className={`px-4 rounded-lg bg-slate-800 dark:bg-emerald-600 text-white text-sm font-semibold ${isOdia ? 'font-odia' : ''}`}
        >
          <BarChart3 className="w-4 h-4" />
        </button>
      </div>

      {loading && <p className="text-center text-sm text-slate-400 py-6">...</p>}

      {!loading && aggregate && aggregate.totalReports === 0 && (
        <p className={`text-center text-slate-500 dark:text-slate-400 text-sm py-6 ${isOdia ? 'font-odia' : ''}`}>{content.officerNoData}</p>
      )}

      {!loading && aggregate && aggregate.totalReports > 0 && (
        <div>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 flex items-center gap-3">
              <ClipboardList className="w-6 h-6 text-slate-500 shrink-0" />
              <div>
                <p className={`text-xs text-slate-400 ${isOdia ? 'font-odia' : ''}`}>{content.officerTotalReports}</p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{aggregate.totalReports}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
              <div>
                <p className={`text-xs text-slate-400 ${isOdia ? 'font-odia' : ''}`}>{content.officerHighSeverity}</p>
                <p className="text-xl font-bold text-red-700 dark:text-red-400">{aggregate.highSeverityCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-5">
            <h3 className={`text-sm font-bold text-slate-700 dark:text-slate-200 mb-3 ${isOdia ? 'font-odia' : ''}`}>
              {content.officerTopDiseases}
            </h3>
            <div className="space-y-3">
              {sortedDiseases.map(([name, count]) => (
                <div key={name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 dark:text-slate-300">{name}</span>
                    <span className="text-slate-400">{count}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${Math.max(6, (count / maxCount) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
              {sortedDiseases.length === 0 && (
                <p className="text-xs text-slate-400">{isOdia ? 'ସମସ୍ତ ରିପୋର୍ଟ ସୁସ୍ଥ ଫସଲର' : 'All reports were healthy crops'}</p>
              )}
            </div>
          </div>
          <p className={`text-[11px] text-slate-400 dark:text-slate-500 mt-4 text-center ${isOdia ? 'font-odia' : ''}`}>
            {isOdia
              ? 'ଏହା ଶସ୍ୟରକ୍ଷକ ବ୍ୟବହାରକାରୀଙ୍କ ସ୍ୱେଚ୍ଛାରେ ସେୟାର୍ କରାଯାଇଥିବା ତଥ୍ୟ ଉପରେ ଆଧାରିତ, ସରକାରୀ ତଥ୍ୟ ନୁହେଁ।'
              : "Based on data voluntarily shared by Shasyarakshak users, not official government statistics."}
          </p>
        </div>
      )}

      {/* Farmer questions queue — the officer can answer with a verified KVK badge. */}
      {!loading && aggregate && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-indigo-600" />
            <h3 className={`text-sm font-bold text-slate-700 dark:text-slate-200 ${isOdia ? 'font-odia' : ''}`}>
              {content.officerQuestionsTitle}
            </h3>
          </div>

          {posts.length === 0 ? (
            <p className={`text-center text-slate-500 dark:text-slate-400 text-sm py-8 ${isOdia ? 'font-odia' : ''}`}>{content.officerNoQuestions}</p>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <div key={post.id} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden">
                  <button onClick={() => toggleExpand(post.id)} className="w-full text-left p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={`font-medium text-slate-800 dark:text-slate-100 text-sm ${isOdia ? 'font-odia' : ''}`}>{post.question}</p>
                        <p className="text-xs text-slate-400 mt-1">{post.authorLabel} · {new Date(post.createdAt).toLocaleDateString()}</p>
                      </div>
                      {expandedId === post.id ? (
                        <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </div>
                  </button>

                  {expandedId === post.id && (
                    <div className="border-t border-slate-100 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-900/40">
                      <div className="space-y-2 mb-3">
                        {(replies[post.id] || []).map((r) => {
                          const isOfficer = r.authorRole === 'officer';
                          return (
                            <div key={r.id} className="flex items-start gap-2">
                              {isOfficer ? (
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 mt-1 shrink-0" />
                              ) : (
                                <MessageCircle className="w-3.5 h-3.5 text-slate-400 mt-1 shrink-0" />
                              )}
                              <div>
                                <p className={`text-sm text-slate-700 dark:text-slate-200 ${isOdia ? 'font-odia' : ''}`}>{r.text}</p>
                                <p className="text-[11px] flex items-center gap-1 flex-wrap">
                                  <span className={isOfficer ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400'}>{r.authorLabel}</span>
                                  {isOfficer && (
                                    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-[10px] font-medium ${isOdia ? 'font-odia' : ''}`}>
                                      <ShieldCheck className="w-2.5 h-2.5" />
                                      {content.officerReplyBadge}
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                        {(replies[post.id] || []).length === 0 && (
                          <p className="text-xs text-slate-400">{isOdia ? 'ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ଉତ୍ତର ନାହିଁ' : 'No replies yet'}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={expandedId === post.id ? replyText : ''}
                          onChange={(e) => setReplyText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleOfficerReply(post.id)}
                          placeholder={content.officerReplyPlaceholder}
                          className={`flex-1 border border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-1.5 text-sm ${isOdia ? 'font-odia' : ''}`}
                        />
                        <button
                          onClick={() => handleOfficerReply(post.id)}
                          disabled={replyingTo === post.id || !replyText.trim()}
                          className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 disabled:opacity-40"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OfficerDashboardView;
