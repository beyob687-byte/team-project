import React from "react";
import { CheckCircle, Radio, Square } from "lucide-react";

const PollWidget = ({ clubId, postId, initialPoll }) => {
  const pollData = initialPoll;

  if (!pollData) return null;

  const showResults =
    Array.isArray(pollData.options) &&
    pollData.options.some((opt) => opt.vote_count !== null);

  return (
    <div className="bg-surface-2 rounded-md p-4 border border-border-glow">
      <h4 className="font-bold text-text-1 mb-3">{pollData.question}</h4>
      <div className="space-y-2">
        {(pollData.options || []).map((option) => (
          <div key={option.id} className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2 p-2 rounded-md bg-surface-3">
              {pollData.multiple_choice ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Radio className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">{option.option_text}</span>
            </div>
            {showResults && option.vote_count !== null && (
              <div className="w-20 text-right text-sm text-text-2">
                {option.vote_count} votes (
                {pollData.total_votes > 0
                  ? ((option.vote_count / pollData.total_votes) * 100).toFixed(
                      0,
                    )
                  : 0}
                %)
              </div>
            )}
          </div>
        ))}
      </div>
      {showResults && pollData.total_votes !== null && (
        <p className="text-sm text-text-3 mt-3">
          Total votes: {pollData.total_votes}
        </p>
      )}
    </div>
  );
};

export default PollWidget;
