import React, { useEffect, useState } from 'react';
import { MessageCircle, Send, Users, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { UIContent, Language, CommunityPost, CommunityReply } from '../types';
import {
  fetchDistrictPosts,
  postQuestion,
  fetchReplies,
  postReply,
  isFirebaseConfigured,
} from '../services/communityService';
import { getFarmProfile } from '../services/farmProfileService';

interface CommunityViewProps {
  content: UIContent;
  lang: Language;
}

const CommunityView: React.FC<CommunityViewProps> = ({ content, lang }) => {
  const isOdia = lang === Language.ODIA;
  const profile = getFarmProfile();
  const district = profile?.district?.trim() || '';
  const configured = isFirebaseConfigured();

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [posting, setPosting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replies, setReplies] = useState<Record<string, CommunityReply[]>>({});
  const [replyText, setReplyText] = useState('');

  const load = async () => {
    if (!configured || !district) return;
    setLoading(true);
    try {
      const data = await fetchDistrictPosts(district);
      setPosts(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePost = async () => {
    if (!question.trim() || !district) return;
    setPosting(true);
    try {
      await postQuestion(district, profile?.cropType || 'auto', question.trim(), isOdia ? `${district}ର ଚାଷୀ` : `Farmer from ${district}`);
      setQuestion('');
      await load();
    } finally {
      setPosting(false);
    }
  };

  const toggleExpand = async (postId: string) => {
    if (expandedId === postId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(postId);
    if (!replies[postId]) {
      const data = await fetchReplies(postId);
      setReplies((prev) => ({ ...prev, [postId]: data }));
    }
  };

  const handleReply = async (postId: string) => {
    if (!replyText.trim()) return;
    await postReply(postId, replyText.trim(), isOdia ? 'ଚାଷୀ' : 'Fellow farmer');
    setReplyText('');
    const data = await fetchReplies(postId);
    setReplies((prev) => ({ ...prev, [postId]: data }));
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

  if (!district) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-10">
        <div className="bg-sky-50 dark:bg-slate-800 border border-sky-100 dark:border-slate-700 rounded-2xl p-5 text-center">
          <Users className="w-8 h-8 text-sky-500 mx-auto mb-2" />
          <p className={`text-sm text-sky-800 dark:text-sky-300 ${isOdia ? 'font-odia' : ''}`}>{content.communityDistrictRequired}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-24">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-indigo-600" />
        <h2 className={`text-lg font-bold text-slate-800 dark:text-slate-100 ${isOdia ? 'font-odia' : ''}`}>
          {district}
        </h2>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 mb-5 flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handlePost()}
          placeholder={content.communityAskPlaceholder}
          className={`flex-1 border border-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm ${isOdia ? 'font-odia' : ''}`}
        />
        <button
          onClick={handlePost}
          disabled={posting || !question.trim()}
          className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {loading && <p className="text-center text-sm text-slate-400 py-6">...</p>}

      {!loading && posts.length === 0 && (
        <p className={`text-center text-slate-500 dark:text-slate-400 text-sm py-10 ${isOdia ? 'font-odia' : ''}`}>{content.communityEmpty}</p>
      )}

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
                  {(replies[post.id] || []).map((r) => (
                    <div key={r.id} className="flex items-start gap-2">
                      <MessageCircle className="w-3.5 h-3.5 text-slate-400 mt-1 shrink-0" />
                      <div>
                        <p className={`text-sm text-slate-700 dark:text-slate-200 ${isOdia ? 'font-odia' : ''}`}>{r.text}</p>
                        <p className="text-[11px] text-slate-400">{r.authorLabel}</p>
                      </div>
                    </div>
                  ))}
                  {(replies[post.id] || []).length === 0 && (
                    <p className="text-xs text-slate-400">
                      {isOdia ? 'ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ଉତ୍ତର ନାହିଁ' : 'No replies yet'}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={content.communityReplyPlaceholder}
                    className="flex-1 border border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-1.5 text-sm"
                  />
                  <button
                    onClick={() => handleReply(post.id)}
                    className={`text-xs font-semibold text-indigo-600 px-3 rounded-lg ${isOdia ? 'font-odia' : ''}`}
                  >
                    {content.communitySendReply}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommunityView;
