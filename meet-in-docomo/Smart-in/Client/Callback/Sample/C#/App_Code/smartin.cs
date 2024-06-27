using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Diagnostics;
using System.Web;
using System.Web.Script.Serialization;

/// <summary>
/// smartin の概要の説明です
/// </summary>
public class smartin
{

    // sin_crypt 暗号化キー（半角英数32桁）
    protected static string KEY_CODE = "{Smart-inキー32桁}";
    // 企業コード
    protected static string COMPANY_CODE = "{Smart-in企業コード4桁}";
    // 依頼区分(要求された電話番号に発信を行い、コールバック認証を行う。)
    protected static string REQUEST_CODE = "C51";
    // Smart-in 依頼用サーバ
    protected static string SMARTIN_SVR= "api.smart-in.biz";	// こちらは試験用です。提供環境に応じ、適宜変更ください。
    // sin_crypt 格納パス
    protected static string SIN_CRYPT_PATH = HttpContext.Current.Request.PhysicalApplicationPath + "sin_crypt.exe";
    // 確認結果POST用URL
    protected static string RESPONSE_URL = "https://" + HttpContext.Current.Request.Url.Host + "{設置DIR}" + "/smartin_response.aspx";	// URLはご利用の環境に応じ、ディレクトリを追記ください。

	public smartin()
	{
		//
		// TODO: コンストラクター ロジックをここに追加します
		//
	}

    /// <summary>
    /// 
    /// </summary>
    /// <param name="tel_no">接続先電話番号</param>
    /// <param name="token_str">トークン</param>
    /// <param name="message">メッセージ</param>
    /// <returns>処理結果</returns>
    public bool request(string tel_no, ref string token_str, ref string message)
    {
        // 処理結果
        bool result = false;

		// smart-inへのリクエストパラメータを生成 
        JavaScriptSerializer serializer = new JavaScriptSerializer();
        string json = serializer.Serialize(
            new {
                company = COMPANY_CODE,
                code = REQUEST_CODE,
                telno = tel_no,
                response_url = RESPONSE_URL
            }
            );
        json = "\"" + json.Replace("\"", "\"\"") + "\"";

        // jsonを専用APIで暗号化してえられた出力
        string batchOutput = "";

        // 暗号化結果を取得
        int batchResult = Utility.processShell(SIN_CRYPT_PATH, "-e " + KEY_CODE + " " + json, ref batchOutput);

		// 暗号化成功
		if(0 == batchResult) {		 
			// Smart-inへの送信データに暗号化したjsonを代入
			string authJson = batchOutput;
			string url = "http://" + SMARTIN_SVR + "/request.cgi";

            string postdata = "company=" + COMPANY_CODE + "&"
                            + "data=" + authJson;

            // Smart-inにリクエスト
            string response = Utility.postData(url, postdata);

            // jsonを専用APIで暗号化してえられた出力
            string responseJson = "";

			// レスポンスをデコードし、画面に表示	 
            int decodeResult = Utility.processShell(SIN_CRYPT_PATH, "-d " + KEY_CODE + " " + response, ref responseJson);
					
			if (0 == decodeResult) {
				// デコードすると token と result が出てくる
				// result 0:認証中 1:認証完了 9:認証失敗
                dynamic jsonObject = serializer.Deserialize<object>(responseJson);

				token_str = jsonObject["token"];

                result = true;
			} else 
			// デコード失敗
            {	 
				message = "デコード失敗";
			}
		// 暗号化失敗   
		} else {
			message = "暗号化失敗";
		}

        return result;
    }

    public bool check(string token, ref string message)
    {
		if (token.Length != 32) {
			return false;
        }

        long smartin_res = 0;

		// 結果を取得（DB使用時）
        SqlConnection connection = new SqlConnection();
        SqlCommand command = new SqlCommand();
        DataTable dt = new DataTable();

        connection.ConnectionString = ConfigurationManager.ConnectionStrings["connectionString"].ToString();
        connection.Open();

        command.CommandText = "SELECT * FROM tokens WHERE token = '" + token + "'";
        command.Connection = connection;

        SqlDataReader sqlDataReader = command.ExecuteReader();

        while (sqlDataReader.Read()) {
            smartin_res = (long)sqlDataReader["status"];
        }

        sqlDataReader.Close();
        command.Connection.Close();
        command.Dispose();
        connection.Close();
        connection.Dispose();

		switch (smartin_res) {
			case 100:
				message = "true";
				break;
			case 101: 
				message = "本人話中";
				break;
			case 102: 
				message = "着信時拒否";
				break;
			case 103: 
				message = "タイムアウト";
				break;
			case 109: 
				message = "例外";
				break;
			default:
				message = "waiting";
				break;
		}

        return true;
    }
}