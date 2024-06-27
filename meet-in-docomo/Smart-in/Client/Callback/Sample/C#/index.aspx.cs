using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Text;
using System.Threading;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

public partial class _Default : System.Web.UI.Page
{
    protected const int STATUS_IDLE = 0;
    protected const int STATUS_WAITING = 1;
    protected const int STATUS_SUCCESS = 2;
    protected const int STATUS_FAIL = 3;

    protected void Page_Load(object sender, EventArgs e)
    {
        if (!IsPostBack)
        {
            Session["token"] = "";
            Session["runThread"] = false;
            Session["message"] = "";
            Session["status"] = STATUS_IDLE;
            Session["smartin"] = new smartin();
        }
    }

    /// <summary>
    /// Smart-in認証ボタンのクリックイベント
    /// </summary>
    /// <param name="sender"></param>
    /// <param name="e"></param>
    protected void ButtonAuthenticate_Click(object sender, EventArgs e)
    {
        callSmartin();
    }

    /// <summary>
    /// Smart-inサーバへリクエストを送信
    /// </summary>
    protected void callSmartin()
    {
        ImageProgres.Visible = true;
        Session["status"] = STATUS_WAITING;
        Thread thread = new Thread(new ThreadStart(callSmartinSub));
        thread.Start();
    }

    protected void callSmartinSub()
    {
        string token = "";
        string message = "";
        bool done = ((smartin)Session["smartin"]).request(TextBoxPhone.Text, ref token, ref message);
        Session["token"] = token;
        Session["message"] = message;

        if (done)
        {
            Session["runThread"] = true;

            while ((bool)Session["runThread"])
            {
                if (check())
                {
                    break;
                }

                Thread.Sleep(5000);
            }
        }
        else
        {
            Session["message"] = (string)Session["message"];
            Session["status"] = STATUS_FAIL;
        }
    }

    protected bool check()
    {
        string token = (string)Session["token"];
        string message = "";
        bool done = ((smartin)Session["smartin"]).check(token, ref message);
        Session["token"] = token;
        Session["message"] = message;

        if (done)
        {
            // 認証成功
            if ("true" == (string)Session["message"])
            {
                Session["message"] = "認証成功";
                Session["status"] = STATUS_SUCCESS;
                return true;
            }
            // 認証中
            else if ("waiting" == (string)Session["message"])
            {
                Session["message"] = "本人確認中";
            }
            // 認証失敗
            else
            {
                Session["message"] = "認証失敗 (" + (string)Session["message"] + ")";
                Session["status"] = STATUS_FAIL;
                return true;
            }
        }
        else
        {
            Session["message"] = "ネットワークエラー (0)";
            Session["status"] = STATUS_FAIL;
            return true;
        }

        return false;
    }

    protected void TimerFormSample_Tick(object sender, EventArgs e)
    {
        switch ((int)Session["status"])
        {
            case STATUS_IDLE:
                ImageProgres.Visible = false;
                LabelMessage.Visible = false;
                LabelDebug.Visible = false;
                break;
            case STATUS_WAITING:
                ImageProgres.Visible = true;
                LabelMessage.Visible = true;
                LabelMessage.Text = (string)Session["message"];
                LabelDebug.Visible = true;
                LabelDebug.Text = "トークン：" + (string)Session["token"];
                break;
            case STATUS_SUCCESS:
                ImageProgres.Visible = false;
                LabelMessage.Visible = true;
                LabelMessage.Text = (string)Session["message"];
                LabelDebug.Visible = true;
                LabelDebug.Text = "トークン：" + (string)Session["token"];
                break;
            case STATUS_FAIL:
                ImageProgres.Visible = false;
                LabelMessage.Visible = true;
                LabelMessage.Text = (string)Session["message"];
                LabelDebug.Visible = true;
                LabelDebug.Text = "トークン：" + (string)Session["token"];
                break;
            default:
                ImageProgres.Visible = false;
                LabelMessage.Visible = false;
                LabelDebug.Visible = false;
                break;
        }
    }
}