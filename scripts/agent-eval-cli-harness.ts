/**
 * CLI eval harness — thay web widget để test agent. OWNER: Dev B.
 * Chạy: npm run eval → chạy từng case trong eval-transcripts-vi.json qua runOrderingAgentTurn
 * (psid giả "eval-<caseId>"), in tool calls + reply, tự chấm pass/fail cơ bản theo expect,
 * ghi kết quả vào **src/fixtures/eval-results.json** { passed, total, comment, generatedAt }
 * — admin-metrics-service import file này cho card NLU (total=0 → card hiện "Chưa chạy eval").
 * Cũng dùng để CHỌN MODEL tối nay: chạy 2 lần với OPENAI_MODEL khác nhau, so pass rate + latency.
 */
// TODO(Dev B): implement runner
console.log("TODO(Dev B): agent-eval-cli-harness");
