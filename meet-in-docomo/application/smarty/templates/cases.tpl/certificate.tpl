{include file="./common/header.tpl"}

<!-- メインコンテンツ[start] -->
<div id="mi_main_contents">
  <!-- コンテンツエリア start -->
	<div id="mi_content_area">
    <div>
      電子証明書付与状態：
      {if $certificateFlg == 1}
        付与済み
      {elseif $certificateFlg == 0 && $certificate != NULL}
        申請中
      {else}
        未申請
      {/if}
    </div>
    <div>
      有効開始時刻　　　： {$certificate.validFrom}
    </div>
    <div>
      有効終了時刻　　　： {$certificate.validTo}
    </div>
    <div>
      申請日時　　　　　： {$certificate.create_date}
    </div>
    <div>
      氏名　　　　　　　： {$certificate.lastname} {$certificate.firstname}
    </div>
    <div>
      氏名（カナ）　　　： {$certificate.lastnameReading} {$certificate.firstnameReading}
    </div>
    <div>
      役職　　　　　　　： {$certificate.title}
    </div>
    <div>
      所属部署　　　　　： {$certificate.department}
    </div>
    <div>
      メールアドレス　　： {$certificate.email}
    </div>
    <div>
      電話番号　　　　　： {$certificate.phone}
    </div>
    <div>
      郵便番号　　　　　： {$certificate.postalCode}
    </div>
    <div>
      所在地住所　　　　： {$certificate.address}
    </div>
    <div>
      法人名　　　　　　： {$certificate.organizationName}
    </div>
    <div>
      法人番号　　　　　： {$certificate.corporationNumber}
    </div>
    <div>
      屋号　　　　　　　： {$certificate.businessName}
    </div>
  </div>
  <!-- コンテンツエリア end -->
</div>
<!-- メインコンテンツ[end] -->

{include file="./common/footer.tpl"}
