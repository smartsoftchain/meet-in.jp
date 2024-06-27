'use strict';
const ParticipantList = class {
  /**
   * コンストラクタ
   */
  constructor(client) {
    console.log('[ParticipantList] init');

    // 一覧にホストがいるか
    this.existHost = false;

    // 使用するクライアントを保存
    this.client = client;
  }

  /**
   * 更新
   */
  refresh() {
    // 初期化
    this.clear();

    // 一覧取得
    let participants = this.client.getParticipantsList();

    // ホスト存在フラグを一旦リセット
    this.existHost = false;

    // テーブルに追加
    // 同時にホストがいるかチェックする
    participants.forEach((participant) => {
      let role = participant.role;
      let name = participant.userId;
      if(participant.id == this.client.getMyId()) {
        name += '(Me)'
      }

      let contents;
      contents += `<tr id=${participant.id}>`;
      contents += `<td class="participant_id">${participant.id}</td>`;
      contents += `<td class="participant_name">${name}</td>`;
      contents += `<td class="participant_role">${role}</td>`;
      contents += `<td>`;
      contents += `<button class="button_permission">許可</button>`;
      contents += `</td>`;
      contents += `</tr>`;
      $('#table_participant tbody').append(contents);

      // 許可ボタンのイベント登録
      $(`#${participant.id} .button_permission`).on('click', this._onClickPermission.bind(this, participant.id, name));

      // ホストがいる
      if (role == 'host') {
        this.existHost = true;
      }
    });
    
    // 全ての許可ボタンを押せないようにする
    $('.button_permission').prop('disabled', true);
  }

  /**
   * 初期化
   */
  clear() {
    // テーブルをリセット
    $('#table_participant tbody').children().remove();
  }

  /**
   * ホストがいるか
   */
  isExistHost() {
    return this.existHost;
  }
  

  /**
   * 「許可」ボタンの処理
   * @param {*} participantId   -参加者ID
   * @param {*} name            -参加者名
   */
  _onClickPermission(participantId, name) {
    let permission = window.confirm(`${name}（${participantId}）さんの発言を許可しますか？`);

    // 許可ボタンを押せないようにする
    $(`#${participantId} .button_permission`).prop('disabled', true);

    // 許可送信
    messenger.sendLiftuphandResponse(permission, participantId);
  }
}
