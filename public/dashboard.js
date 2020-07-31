$(document).ready(() => {
  const basePath = $('#basePath').val();

  function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  function isValidQueueAction(data) {
    const { action, queues } = data;

    if (action === 'retry' && queues.length > 1) {
      window.alert('Please, select only 1 queue.');
      return false;
    }

    if (action === 'retry' && queues.length === 0) {
      window.alert('Please, select 1 queue.');
      return false;
    }

    if (action === 'resume' && queues.length === 0) {
      window.alert('Please, select 1 queue.');
      return false;
    }

    if (action === 'pause' && queues.length === 0) {
      window.alert('Please, select 1 queue.');
      return false;
    }

    return true;
  }

  // Set up individual "retry job" handler
  $('.js-retry-job').on('click', function(e) {
    e.preventDefault();
    $(this).prop('disabled', true);

    const jobId = $(this).data('job-id');
    const queueName = $(this).data('queue-name');
    const queueHost = $(this).data('queue-host');

    const r = window.confirm(`Retry job #${jobId} in queue "${queueHost}/${queueName}"?`);
    if (r) {
      $.ajax({
        method: 'PATCH',
        url: `${basePath}/api/queue/${encodeURIComponent(queueHost)}/${encodeURIComponent(queueName)}/job/${encodeURIComponent(jobId)}`
      }).done(() => {
        window.location.reload();
      }).fail((jqXHR) => {
        window.alert(`Request failed, check console for error.`);
        console.error(jqXHR.responseText);
      });
    } else {
      $(this).prop('disabled', false);
    }
  });

  // Set up individual "remove job" handler
  $('.js-remove-job').on('click', function(e) {
    e.preventDefault();
    $(this).prop('disabled', true);

    const jobId = $(this).data('job-id');
    const queueName = $(this).data('queue-name');
    const queueHost = $(this).data('queue-host');
    const jobState = $(this).data('job-state');

    const r = window.confirm(`Remove job #${jobId} in queue "${queueHost}/${queueName}"?`);
    if (r) {
      $.ajax({
        method: 'DELETE',
        url: `${basePath}/api/queue/${encodeURIComponent(queueHost)}/${encodeURIComponent(queueName)}/job/${encodeURIComponent(jobId)}`
      }).done(() => {
        window.location.href = `${basePath}/${encodeURIComponent(queueHost)}/${encodeURIComponent(queueName)}/${jobState}`;
      }).fail((jqXHR) => {
        window.alert(`Request failed, check console for error.`);
        console.error(jqXHR.responseText);
      });
    } else {
      $(this).prop('disabled', false);
    }
  });

  // Set up "select all queues" button handler
  $('.js-select-all-queues').change(function() {
    const $queueBulkCheckboxes = $('.js-bulk-queue');
    $queueBulkCheckboxes.prop('checked', this.checked);
  });

  // Set up "select all jobs" button handler
  $('.js-select-all-jobs').change(function() {
    const $jobBulkCheckboxes = $('.js-bulk-job');
    $jobBulkCheckboxes.prop('checked', this.checked);
  });

  // Set up "shift-click" multiple checkbox selection handler
  (function() {
    // https://stackoverflow.com/questions/659508/how-can-i-shift-select-multiple-checkboxes-like-gmail
    let lastChecked = null;
    let $jobBulkCheckboxes = $('.js-bulk-job');
    $jobBulkCheckboxes.click(function(e) {
      if (!lastChecked) {
        lastChecked = this;
        return;
      }

      if (e.shiftKey) {
        let start = $jobBulkCheckboxes.index(this);
        let end = $jobBulkCheckboxes.index(lastChecked);

        $jobBulkCheckboxes.slice(
          Math.min(start, end),
          Math.max(start, end) + 1
        ).prop('checked', lastChecked.checked);
      }

      lastChecked = this;
    });
  })();

  $('.js-queue-action').on('click', function(e) {
    $(this).prop('disabled', true);

    const $queueActionContainer = $('.js-queue-action-container');

    let data = {
      action: $(e.target).data('action'),
      queues: [],
    };

    $queueActionContainer.each((index, value) => {
      const isChecked = $(value).find('[name=queueChecked]').is(':checked');
      const queueName = $(value).find('[name=queueName]').html();
      const queueHost = $(value).find('[name=queueHost]').html();

      if (isChecked) {
        data.queues.push({
          name: queueName,
          host: queueHost,
        });
      }
    });

    if (!isValidQueueAction(data)) {
      return;
    }

    const confirmation = window.confirm(
      `Warning! You are about to ${capitalize(data.action)} ${data.queues.length} queue(s). Do you confirm this action?`
    );

    if (confirmation) {
      $.ajax({
        method: 'POST',
        url: `${basePath}/api/queue/${data.action}`,
        data: JSON.stringify(data),
        contentType: 'application/json'
      }).done(() => {
        window.location.reload();
      }).fail((jqXHR) => {
        window.alert(`Request failed, check console for error.`);
        console.error(jqXHR.responseText);
      });
    } else {
      $(this).prop('disabled', false);
    }
  });

  // Set up bulk actions handler
  $('.js-bulk-action').on('click', function(e) {
    $(this).prop('disabled', true);

    const $bulkActionContainer = $('.js-bulk-action-container');
    const action = $(this).data('action');
    const queueName = $(this).data('queue-name');
    const queueHost = $(this).data('queue-host');
    const queueState = $(this).data('queue-state');

    let data = {
      queueName,
      action: 'remove',
      jobs: []
    };

    $bulkActionContainer.each((index, value) => {
      const isChecked = $(value).find('[name=jobChecked]').is(':checked');
      const id = encodeURIComponent($(value).find('[name=jobId]').val());

      if (isChecked) {
        data.jobs.push(id);
      }
    });

    const r = window.confirm(`${capitalize(action)} ${data.jobs.length} ${data.jobs.length > 1 ? 'jobs' : 'job'} in queue "${queueHost}/${queueName}"?`);
    if (r) {
      $.ajax({
        method: action === 'remove' ? 'POST' : 'PATCH',
        url: `${basePath}/api/queue/${encodeURIComponent(queueHost)}/${encodeURIComponent(queueName)}/job/bulk`,
        data: JSON.stringify(data),
        contentType: 'application/json'
      }).done(() => {
        window.location.reload();
      }).fail((jqXHR) => {
        window.alert(`Request failed, check console for error.`);
        console.error(jqXHR.responseText);
      });
    } else {
      $(this).prop('disabled', false);
    }
  });

  $('.js-toggle-add-job-editor').on('click', function() {
    $('.json-editor').toggleClass('hide');
  });

  $('.json-text').keyup(function() {
    try {
      JSON.parse($(this).val());
      $('.js-add-job').prop('disabled', false);
      $('.js-add-job').html('Create');
      $('.js-format-json').prop('disabled', false);
    } catch (e) {
      $('.js-add-job').prop('disabled', true);
      $('.js-add-job').html('Invalid JSON');
      $('.js-format-json').prop('disabled', true);
    }
  });

  $('.js-format-json').on('click', function() {
    const json = $('.json-text').val();
    const parsed = JSON.parse(json);
    const string = JSON.stringify(parsed, undefined, 4);

    $('.json-text').val(string);
  })

  $('.js-add-job').on('click', function() {
    const data = JSON.parse($('.json-text').val());
    const { queueHost, queueName } = window.arenaInitialPayload;

    $.ajax({
      url: `${basePath}/api/queue/${queueHost}/${queueName}/job`,
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json'
    }).done(() => {
      alert('Job successfully added!');
      $('.json-editor').toggleClass('hide');
    }).fail((jqXHR) => {
      window.alert('Failed to save job, check console for error.');
      console.error(jqXHR.responseText);
    });
  });
});
