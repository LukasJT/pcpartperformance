'use strict';
// Failure context already belongs to the public, credential-free validation
// job. Encode workflow-command data so log content cannot create new commands.
function failureAnnotation(command, output) {
  const text = (String(command) + '\n' + String(output).slice(-3500))
    .replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, '')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
    .replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
  return '::error title=Regression check failed::' + text;
}
module.exports = { failureAnnotation };
