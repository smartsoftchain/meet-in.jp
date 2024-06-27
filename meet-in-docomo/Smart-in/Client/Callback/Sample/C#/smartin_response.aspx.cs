using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.UI;
using System.Web.UI.WebControls;

public partial class smartin_response : System.Web.UI.Page
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
    protected static string SIN_CRYPT_PATH = HttpContext.Current.Request.PhysicalApplicationPath + "{設置DIR}" + "sin_crypt.exe";

    protected void Page_Load(object sender, EventArgs e)
    {
        if (null == Request.Form["data"])
        {
            return;
        }

        // 暗号化解除
        string encryptedJson = Request.Form["data"];

        // jsonを専用APIで暗号化してえられた出力
        string output = "";

		// レスポンスをデコードし、画面に表示	 
        int decodeResult = Utility.processShell(SIN_CRYPT_PATH, "-d " + KEY_CODE + " " + encryptedJson, ref output);

        // JSONのデコード
        if (0 == decodeResult) {
            JavaScriptSerializer serializer = new JavaScriptSerializer();

	        // デコードするとtokenとdetail(結果)が出てくる
	        // detail 00:正常, 01:ビジー, 02:着信時拒否, 03:タイムアウト
            dynamic responseArray = serializer.Deserialize<object>(output);

	        string token = responseArray["token"];
            int status = 0;

	        // 正常（規定時間内に接続）
	        if (responseArray["detail"] == "00")
            {
		        status = 100;
	        // ビジー(本人話中)
	        }
            else if (responseArray["detail"] == "01") 
            {
		        status = 101;
	        // 着信時拒否（スマホのみ）
	        } 
            else if (responseArray["detail"] == "02") 
            {
		        status = 102;
	        // タイムアウト（応答無し、接続不可）
	        } 
            else if (responseArray["detail"] == "03") 
            {
		        status = 103;
	        // 例外
	        } else {
		        status = 109;
	        }

	        // 結果を保存（DB使用時）
	        // ※注意：定期的に古いレコードを削除する必要があります
            string connectionString = ConfigurationManager.ConnectionStrings["connectionString"].ToString();
            SqlConnection sqlConnection = new SqlConnection(connectionString);
            sqlConnection.Open();
            SqlTransaction sqlTransaction = sqlConnection.BeginTransaction();
            SqlCommand sqlCommand = sqlConnection.CreateCommand();
            sqlCommand.Transaction = sqlTransaction;

            try {
                sqlCommand.CommandText =
                    "INSERT INTO tokens ("
                    + "token, "
                    + "status"
                    + ") VALUES ("
                    + "'" + token + "', "
                    + "'" + status + "' "
                    + ")";
                sqlCommand.ExecuteNonQuery();

                sqlTransaction.Commit();
            } catch (Exception ex) {
                try {
                    sqlTransaction.Rollback();
                } catch (Exception exRollback) {
                }
            }
        }
    }
}