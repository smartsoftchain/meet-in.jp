<%@ Page Language="C#" AutoEventWireup="true" CodeFile="index.aspx.cs" Inherits="_Default" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title></title>


</head>
<body>
    <form id="formSample" runat="server">
        <asp:ScriptManager EnablePartialRendering="true" ID="ScriptManagerFormSample" runat="server"></asp:ScriptManager>
        <div>
            <asp:Timer ID="TimerFormSample" runat="server" Interval="100" ontick="TimerFormSample_Tick"/>
        </div>
        <asp:Label ID="LabelTextBoxPhone" runat="server" Text="認証電話番号"></asp:Label>
        <br />
        <asp:TextBox ID="TextBoxPhone" runat="server"></asp:TextBox>
        <p>
            <asp:Button ID="ButtonAuthenticate" runat="server" Text="Smart-in認証" OnClick="ButtonAuthenticate_Click" />
        </p>
        <asp:UpdatePanel ID="UpdatePanelFormSample" runat="server">
            <ContentTemplate>
                <asp:Image ID="ImageProgres" runat="server" ImageUrl="~/calling.gif" Visible="False" />
                <p>&nbsp;</p>
                <asp:Label ID="LabelMessage" runat="server" Visible="False"></asp:Label>
                <p>&nbsp;</p>
                <asp:Label ID="LabelDebug" runat="server" Visible="True"></asp:Label>
                <asp:Literal ID="LiteralScript" runat="server"></asp:Literal>
            </ContentTemplate>
            <Triggers>
                <asp:AsyncPostBackTrigger ControlID="TimerFormSample" EventName="Tick" />
            </Triggers>
        </asp:UpdatePanel>
    </form>
</body>
</html>
