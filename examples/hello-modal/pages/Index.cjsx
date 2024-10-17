<Page route="/">
	<Env declarations='{"num": "0"}'>
		Num: <Val expr="$num"/>
		<NumActions var="$num">
			<Modal block="Popup">
				<div>
					<Button action="confirm, increase" class="bg-blue p-2 rounded m-2">Add</Button>
					<Button action="show" class="bg-blue p-2 rounded m-2">Show</Button>
				</div>
			</Modal>
		</NumActions>
	</Env>
</Page>