using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Web;

/// <summary>
/// Utility の概要の説明です
/// </summary>
public class Utility
{
	public Utility()
	{
		//
		// TODO: コンストラクター ロジックをここに追加します
		//
	}

    /// <summary>
    /// バッチ処理を実行する
    /// </summary>
    /// <param name="batchPath">バッチのパス</param>
    /// <param name="batchArguments">バッチの引数</param>
    /// <param name="output">出力</param>
    /// <returns>実行結果</returns>
    public static int processShell(string batchPath, string batchArguments, ref string output)
    {
        // プロセス起動情報の構築
        ProcessStartInfo startInfo = new ProcessStartInfo();

        // バッチファイルを起動する人は、cmd.exeさんなので
        startInfo.FileName = "cmd.exe";

        // コマンド処理実行後、コマンドウィンドウ終わるようにする。
        //（↓「/c」の後の最後のスペース1文字は重要！）
        startInfo.Arguments = "/c ";

        // コマンド処理であるバッチファイル （ここも最後のスペース重要）
        startInfo.Arguments += batchPath;

        // バッチファイルへの引数 
        startInfo.Arguments += " " + batchArguments;

        // 出力を読み取れるようにする
        startInfo.UseShellExecute = false;
        startInfo.RedirectStandardOutput = true;

        // バッチファイルを別プロセスとして起動
        Process process = Process.Start(startInfo);

        // jsonを専用APIで暗号化してえられた出力
        string outputTemp = process.StandardOutput.ReadToEnd();

        if (outputTemp.Length > 2) {
            output = outputTemp.Substring(0, outputTemp.Length - 2);
        }

        // 上記バッチ処理が終了するまで待ちます。
        process.WaitForExit();

        // 暗号化結果を取得
        int outputResult = process.ExitCode;

        // プロセス終了
        process.Close();

        return outputResult;
    }

    public static string postData(string url, string postData)
    {
        string responseFromServer = null;
        WebResponse response = null;
        Stream dataStream = null;
        StreamReader reader = null;

        try
        {
            WebRequest request = WebRequest.Create(url);
            request.Method = "POST";
            byte[] byteArray = Encoding.UTF8.GetBytes(postData);
            request.ContentType = "application/x-www-form-urlencoded";
            request.ContentLength = byteArray.Length;
            dataStream = request.GetRequestStream();
            dataStream.Write(byteArray, 0, byteArray.Length);
            dataStream.Close();
            response = request.GetResponse();
            dataStream = response.GetResponseStream();
            reader = new StreamReader(dataStream);
            responseFromServer = reader.ReadToEnd();
        }
        catch (WebException e)
        {
            WebException e1 = e;
            WebException e2 = e;
        }
        finally
        {
            // Clean up the streams.
            if (null != reader)
            {
                reader.Close();
            }
            if (null != dataStream)
            {
                dataStream.Close();
            }
            if (null != response)
            {
                response.Close();
            }
        }

        return responseFromServer;
    }
}